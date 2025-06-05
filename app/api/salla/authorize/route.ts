import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// إنشاء عميل Supabase للخادم
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// التحقق من صحة webhook من سلة
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex")

    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  } catch (error) {
    console.error("Error verifying webhook signature:", error)
    return false
  }
}

// إنشاء مستخدم جديد من بيانات سلة
async function createUserFromSallaData(storeData: any) {
  try {
    const userData = {
      name: storeData.store?.name || storeData.merchant?.name || "متجر سلة",
      email: storeData.merchant?.email || `store-${storeData.store_id}@temp.local`,
      salla_store_id: storeData.store_id,
      salla_connected: true,
      phone: storeData.merchant?.mobile || null,
    }

    // إنشاء مستخدم في Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: crypto.randomBytes(32).toString("hex"), // كلمة مرور عشوائية
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        salla_store_id: userData.salla_store_id,
        created_via: "salla_webhook",
      },
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      throw authError
    }

    // إنشاء ملف المستخدم في قاعدة البيانات
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        id: authUser.user!.id,
        ...userData,
      })
      .select()
      .single()

    if (userError) {
      console.error("Error creating user profile:", userError)
      throw userError
    }

    // ربط المستخدم بدور العميل
    const { data: customerRole } = await supabase.from("roles").select("id").eq("name", "customer").single()

    if (customerRole) {
      await supabase.from("user_roles").insert({
        user_id: user.id,
        role_id: customerRole.id,
      })
    }

    return user
  } catch (error) {
    console.error("Error creating user from Salla data:", error)
    throw error
  }
}

// حفظ بيانات اتصال سلة
async function saveSallaConnection(userId: string, webhookData: any) {
  try {
    const connectionData = {
      user_id: userId,
      store_id: webhookData.store_id,
      store_name: webhookData.store?.name || "متجر سلة",
      access_token: webhookData.access_token,
      refresh_token: webhookData.refresh_token,
      token_expires_at: webhookData.expires_in
        ? new Date(Date.now() + webhookData.expires_in * 1000).toISOString()
        : null,
      is_active: true,
      last_sync_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("salla_connections")
      .upsert(connectionData, {
        onConflict: "store_id",
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving Salla connection:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in saveSallaConnection:", error)
    throw error
  }
}

// إنشاء جلسة دخول للمستخدم
async function createUserSession(userId: string) {
  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: "", // سيتم تجاهله لأننا نستخدم user_id
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?salla_connected=true`,
      },
    })

    if (error) {
      console.error("Error creating user session:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in createUserSession:", error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    console.log("🔔 Received Salla webhook at /api/salla/authorize")

    // قراءة البيانات
    const body = await request.text()
    const webhookData = JSON.parse(body)

    console.log("📦 Webhook data:", {
      event: webhookData.event,
      store_id: webhookData.data?.store_id,
      merchant_email: webhookData.data?.merchant?.email,
    })

    // التحقق من نوع الحدث
    if (webhookData.event !== "app.store.authorize") {
      console.log("⚠️ Ignoring non-authorization event:", webhookData.event)
      return NextResponse.json({
        success: true,
        message: "Event ignored",
      })
    }

    // التحقق من وجود البيانات المطلوبة
    const { data } = webhookData
    if (!data?.store_id || !data?.access_token || !data?.refresh_token) {
      console.error("❌ Missing required data in webhook")
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // التحقق من التوقيع (إذا كان متوفراً)
    const signature = request.headers.get("x-salla-signature")
    const webhookSecret = process.env.SALLA_WEBHOOK_SECRET

    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(body, signature, webhookSecret)
      if (!isValid) {
        console.error("❌ Invalid webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
      console.log("✅ Webhook signature verified")
    }

    // البحث عن مستخدم موجود بنفس store_id
    let user = null
    const { data: existingConnection } = await supabase
      .from("salla_connections")
      .select(`
        *,
        user:users(*)
      `)
      .eq("store_id", data.store_id)
      .single()

    if (existingConnection?.user) {
      console.log("👤 Found existing user for store:", data.store_id)
      user = existingConnection.user
    } else {
      // البحث بالإيميل إذا كان متوفراً
      if (data.merchant?.email) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", data.merchant.email)
          .single()

        if (existingUser) {
          console.log("👤 Found existing user by email:", data.merchant.email)
          user = existingUser
        }
      }

      // إنشاء مستخدم جديد إذا لم يوجد
      if (!user) {
        console.log("🆕 Creating new user for store:", data.store_id)
        user = await createUserFromSallaData(data)
      }
    }

    // حفظ/تحديث بيانات الاتصال
    console.log("💾 Saving Salla connection data")
    const connection = await saveSallaConnection(user.id, data)

    // تحديث حالة المستخدم
    await supabase
      .from("users")
      .update({
        salla_store_id: data.store_id,
        salla_connected: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    // إنشاء القوالب الافتراضية إذا لم تكن موجودة
    const { data: existingTemplates } = await supabase.from("templates").select("id").eq("user_id", user.id).limit(1)

    if (!existingTemplates || existingTemplates.length === 0) {
      console.log("📝 Creating default templates for new user")

      // استدعاء دالة إنشاء القوالب الافتراضية
      await supabase.rpc("create_default_templates_for_user", {
        user_uuid: user.id,
      })
    }

    console.log("✅ Salla webhook processed successfully")

    // إعادة توجيه المستخدم إلى لوحة التحكم
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?salla_connected=true&store_id=${data.store_id}`

    return NextResponse.redirect(redirectUrl, { status: 302 })
  } catch (error) {
    console.error("❌ Error processing Salla webhook:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// دعم GET للاختبار
export async function GET() {
  return NextResponse.json({
    message: "Salla authorization endpoint is ready",
    timestamp: new Date().toISOString(),
  })
}
