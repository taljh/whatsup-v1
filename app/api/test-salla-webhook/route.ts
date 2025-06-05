import { NextResponse } from "next/server"

// هذا مثال لبيانات webhook من سلة عند تثبيت التطبيق
const mockSallaWebhookData = {
  event: "app.store.authorize",
  data: {
    access_token: "example_access_token_123",
    refresh_token: "example_refresh_token_456",
    expires_in: 31536000, // سنة واحدة بالثواني
    store_id: "123456",
    store: {
      name: "متجر الأمثلة",
      url: "https://example-store.mysalla.com",
    },
    merchant: {
      name: "محمد أحمد",
      email: "merchant@example.com",
      mobile: "+966501234567",
    },
  },
}

export async function GET() {
  return NextResponse.json({
    message: "استخدم طريقة POST لاختبار webhook سلة",
    example: mockSallaWebhookData,
  })
}

export async function POST() {
  // محاكاة استلام webhook من سلة
  console.log("🔔 تم استلام webhook من سلة (محاكاة)")
  console.log(JSON.stringify(mockSallaWebhookData, null, 2))

  // في الحالة الحقيقية، سنقوم بمعالجة البيانات وحفظها في قاعدة البيانات

  return NextResponse.json({
    success: true,
    message: "تم استلام بيانات التثبيت بنجاح (محاكاة)",
    receivedData: mockSallaWebhookData,
  })
}
