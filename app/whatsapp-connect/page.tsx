"use client"

import { useState } from "react"
import { useAuth } from "../components/AuthProvider"
import { database } from "../../lib/supabase"

export default function WhatsAppConnect() {
  const { userProfile, refreshProfile } = useAuth()
  const [connecting, setConnecting] = useState(false)
  const [qrCode] = useState(
    "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp-web-connect-demo-" + Date.now(),
  )

  const handleConnect = async () => {
    setConnecting(true)
    // محاكاة عملية الربط - سيتم استبدالها بالربط الفعلي لاحقاً
    setTimeout(async () => {
      try {
        await database.updateUserProfile({
          whatsapp_status: true,
          whatsapp_session_data: {
            connected_at: new Date().toISOString(),
            session_id: "demo-session-" + Date.now(),
          },
        })

        await refreshProfile()
        alert("تم ربط واتساب بنجاح!")
        window.location.href = "/"
      } catch (error) {
        console.error("Error updating connection:", error)
        alert("حدث خطأ في الربط")
      } finally {
        setConnecting(false)
      }
    }, 2000)
  }

  const handleBack = () => {
    window.location.href = "/"
  }

  return (
    <div className="p-8 h-full">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">ربط واتساب ويب</h1>
          <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Connection Status */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">حالة الاتصال</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                userProfile?.whatsapp_status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {userProfile?.whatsapp_status ? "متصل" : "غير متصل"}
            </span>
          </div>

          {userProfile?.whatsapp_session_data && (
            <p className="text-gray-600 text-sm">
              آخر اتصال: {new Date(userProfile.whatsapp_session_data.connected_at).toLocaleString("ar-SA")}
            </p>
          )}
        </div>

        {/* QR Code Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">امسح الكود للربط</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              افتح واتساب على هاتفك، اذهب إلى الإعدادات {">"} الأجهزة المرتبطة {">"} ربط جهاز، ثم امسح هذا الكود
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
              <img src={qrCode || "/placeholder.svg"} alt="QR Code" className="w-48 h-48" />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 text-right">
              <h4 className="font-medium text-blue-900 mb-2">خطوات الربط:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. افتح تطبيق واتساب على هاتفك</li>
                <li>2. اذهب إلى الإعدادات (النقاط الثلاث في الأعلى)</li>
                <li>3. اختر "الأجهزة المرتبطة"</li>
                <li>4. اضغط على "ربط جهاز"</li>
                <li>5. امسح الكود أعلاه</li>
              </ol>
            </div>

            <button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {connecting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  جاري الربط...
                </span>
              ) : (
                "تأكيد الربط (تجريبي)"
              )}
            </button>

            <p className="text-xs text-gray-500">ملاحظة: هذا كود تجريبي. سيتم ربط النظام بواتساب ويب الفعلي لاحقاً.</p>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button onClick={handleBack} className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  )
}
