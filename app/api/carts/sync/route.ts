import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sallaConnections } from "@/lib/salla"

// إنشاء عميل Supabase للخادم
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  try {
    // التحقق من المصادقة
    const { data: session } = await supabase.auth.getSession()
    if (!session.session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.session.user.id

    // جلب السلات المتروكة من سلة
    const carts = await sallaConnections.fetchAbandonedCarts(userId)

    // حفظ السلات في قاعدة البيانات
    const result = await sallaConnections.saveAbandonedCarts(userId, carts)

    return NextResponse.json({
      success: true,
      totalCarts: carts.length,
      savedCarts: result.saved,
      skippedCarts: result.skipped,
    })
  } catch (error) {
    console.error("Error syncing carts:", error)
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
    message: "Use POST to sync abandoned carts",
    timestamp: new Date().toISOString(),
  })
}
