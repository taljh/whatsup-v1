"use client"

import { useState } from "react"
import { isSupabaseConfigured } from "../../lib/supabase"

export default function ConfigInfo() {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setShowInfo(!showInfo)}
        className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${
          isSupabaseConfigured
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-amber-100 text-amber-800 border border-amber-200"
        }`}
      >
        <div className="flex items-center space-x-2 space-x-reverse">
          <div
            className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? "bg-green-500" : "bg-amber-500"} animate-pulse`}
          ></div>
          <span>{isSupabaseConfigured ? "متصل بقاعدة البيانات" : "وضع التطوير"}</span>
        </div>
      </button>

      {showInfo && (
        <div className="absolute bottom-12 left-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-sm">
          <h3 className="font-bold mb-2">معلومات التكوين</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">حالة Supabase:</span>{" "}
              <span className={isSupabaseConfigured ? "text-green-600" : "text-amber-600"}>
                {isSupabaseConfigured ? "متصل" : "غير متصل"}
              </span>
            </div>
            <div>
              <span className="font-medium">وضع التشغيل:</span> <span>{isSupabaseConfigured ? "إنتاج" : "تطوير"}</span>
            </div>
            <div>
              <span className="font-medium">المصادقة:</span> <span>{isSupabaseConfigured ? "حقيقية" : "وهمية"}</span>
            </div>
            <div>
              <span className="font-medium">البيانات:</span> <span>{isSupabaseConfigured ? "حقيقية" : "وهمية"}</span>
            </div>
          </div>

          {!isSupabaseConfigured && (
            <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-200 text-xs">
              <p className="font-medium mb-1">لتفعيل قاعدة البيانات:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>أضف متغيرات البيئة في ملف .env.local</li>
                <li>أعد تشغيل التطبيق</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
