import { createClient } from "@supabase/supabase-js"
import { SallaAPI, sallaConnections } from "./salla"

// إنشاء عميل Supabase للخادم
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// استخراج معلومات العميل من بيانات سلة
function extractCustomerInfo(order: any) {
  const customer = order.customer || {}
  const shipping = order.shipping || {}
  const shippingAddress = shipping.address || {}

  return {
    name: customer.first_name ? `${customer.first_name} ${customer.last_name || ""}` : shippingAddress.name || "عميل",
    email: customer.email || null,
    phone: customer.mobile || shippingAddress.phone || null,
  }
}

// تحويل بيانات الطلب إلى تنسيق السلة المتروكة
function mapOrderToAbandonedCart(order: any, userId: string) {
  const customer = extractCustomerInfo(order)
  const items = order.items || []

  return {
    user_id: userId,
    salla_cart_id: order.id.toString(),
    customer_name: customer.name,
    customer_phone: customer.phone,
    customer_email: customer.email,
    cart_url: order.url || `https://${order.store_subdomain}.mysalla.com/cart`,
    total_amount: order.amounts?.total?.amount || 0,
    currency: order.currency || "SAR",
    items: items,
    status: "pending",
    first_reminder_sent: false,
    second_reminder_sent: false,
  }
}

// سحب السلات المتروكة من سلة
export async function fetchAbandonedCartsFromSalla(userId: string) {
  try {
    console.log(`🔄 Fetching abandoned carts for user ${userId}`)

    // الحصول على اتصال سلة للمستخدم
    const connection = await sallaConnections.getByUserId(userId)
    if (!connection) {
      console.error(`❌ No active Salla connection found for user ${userId}`)
      return { success: false, message: "No active Salla connection found" }
    }

    // إنشاء عميل API سلة
    const sallaApi = new SallaAPI(connection.access_token)

    // جلب الطلبات المعلقة (السلات المتروكة)
    const response = await sallaApi.getAbandonedCarts()
    const orders = response.data || []

    console.log(`📦 Found ${orders.length} abandoned carts`)

    // تحويل الطلبات إلى سلات متروكة
    const abandonedCarts = orders.map((order: any) => mapOrderToAbandonedCart(order, userId))

    // حفظ السلات المتروكة في قاعدة البيانات
    const results = await Promise.all(
      abandonedCarts.map(async (cart) => {
        // التحقق من وجود السلة مسبقاً
        const { data: existingCart } = await supabase
          .from("abandoned_carts")
          .select("id")
          .eq("salla_cart_id", cart.salla_cart_id)
          .eq("user_id", userId)
          .single()

        if (existingCart) {
          console.log(`⏭️ Cart ${cart.salla_cart_id} already exists, skipping`)
          return { skipped: true, cartId: existingCart.id }
        }

        // إضافة السلة الجديدة
        const { data, error } = await supabase
          .from("abandoned_carts")
          .insert({
            ...cart,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.error(`❌ Error saving cart ${cart.salla_cart_id}:`, error)
          return { error: true, message: error.message }
        }

        console.log(`✅ Saved cart ${cart.salla_cart_id} with ID ${data.id}`)
        return { success: true, cartId: data.id }
      }),
    )

    // تحديث وقت آخر مزامنة
    await supabase
      .from("salla_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", connection.id)

    return {
      success: true,
      totalCarts: orders.length,
      savedCarts: results.filter((r) => r.success).length,
      skippedCarts: results.filter((r) => r.skipped).length,
      failedCarts: results.filter((r) => r.error).length,
    }
  } catch (error) {
    console.error("❌ Error fetching abandoned carts:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// إرسال رسائل تذكير للسلات المتروكة
export async function sendRemindersForAbandonedCarts(userId: string) {
  try {
    console.log(`🔔 Checking for carts that need reminders for user ${userId}`)

    // الحصول على إعدادات المستخدم
    const { data: settings } = await supabase.from("settings").select("*").eq("user_id", userId).single()

    if (!settings || !settings.is_active) {
      console.log(`⏭️ Reminders are disabled for user ${userId}`)
      return { success: true, message: "Reminders are disabled" }
    }

    // الحصول على القوالب النشطة
    const { data: templates } = await supabase
      .from("templates")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .in("type", ["first", "second"])

    if (!templates || templates.length === 0) {
      console.error(`❌ No active templates found for user ${userId}`)
      return { success: false, message: "No active templates found" }
    }

    const firstReminderTemplate = templates.find((t) => t.type === "first")
    const secondReminderTemplate = templates.find((t) => t.type === "second")

    if (!firstReminderTemplate) {
      console.error(`❌ No first reminder template found for user ${userId}`)
      return { success: false, message: "No first reminder template found" }
    }

    // الحصول على السلات المتروكة التي تحتاج إلى تذكير
    const now = new Date()
    const firstReminderDelay = settings.delay_minutes_first || 60 // 60 دقيقة افتراضياً
    const secondReminderDelay = settings.delay_minutes_second || 1440 // 24 ساعة افتراضياً

    // السلات التي تحتاج إلى التذكير الأول
    const firstReminderTime = new Date(now.getTime() - firstReminderDelay * 60 * 1000)
    const { data: firstReminderCarts } = await supabase
      .from("abandoned_carts")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending")
      .eq("first_reminder_sent", false)
      .lt("created_at", firstReminderTime.toISOString())

    console.log(`📬 Found ${firstReminderCarts?.length || 0} carts for first reminder`)

    // السلات التي تحتاج إلى التذكير الثاني
    let secondReminderCarts: any[] = []
    if (settings.second_reminder_enabled && secondReminderTemplate) {
      const secondReminderTime = new Date(now.getTime() - secondReminderDelay * 60 * 1000)
      const { data: carts } = await supabase
        .from("abandoned_carts")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "pending")
        .eq("first_reminder_sent", true)
        .eq("second_reminder_sent", false)
        .lt("first_reminder_sent_at", secondReminderTime.toISOString())

      secondReminderCarts = carts || []
      console.log(`📬 Found ${secondReminderCarts.length} carts for second reminder`)
    }

    // هنا سيتم إرسال الرسائل (في التطبيق الحقيقي)
    // لأغراض هذا المثال، سنقوم فقط بتحديث حالة السلات

    // تحديث السلات التي تم إرسال التذكير الأول لها
    if (firstReminderCarts && firstReminderCarts.length > 0) {
      await Promise.all(
        firstReminderCarts.map(async (cart) => {
          await supabase
            .from("abandoned_carts")
            .update({
              first_reminder_sent: true,
              first_reminder_sent_at: now.toISOString(),
              updated_at: now.toISOString(),
            })
            .eq("id", cart.id)

          console.log(`✅ Marked first reminder as sent for cart ${cart.id}`)
        }),
      )
    }

    // تحديث السلات التي تم إرسال التذكير الثاني لها
    if (secondReminderCarts.length > 0) {
      await Promise.all(
        secondReminderCarts.map(async (cart) => {
          await supabase
            .from("abandoned_carts")
            .update({
              second_reminder_sent: true,
              second_reminder_sent_at: now.toISOString(),
              updated_at: now.toISOString(),
            })
            .eq("id", cart.id)

          console.log(`✅ Marked second reminder as sent for cart ${cart.id}`)
        }),
      )
    }

    return {
      success: true,
      firstRemindersSent: firstReminderCarts?.length || 0,
      secondRemindersSent: secondReminderCarts.length,
    }
  } catch (error) {
    console.error("❌ Error sending reminders:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
