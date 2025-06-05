import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendRemindersForAbandonedCarts } from "@/lib/abandoned-carts"

// إنشاء عميل Supabase للخادم
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: Request) {
  try {
    // التحقق من المصادقة
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const { data: user, error } = await supabase.auth.getUser(token)

    if (error || !user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // إرسال رسائل التذكير
    const result = await sendRemindersForAbandonedCarts(user.user.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending reminders:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
