"use client"

import { useState, useEffect } from "react"
import { isSupabaseConfigured } from "../../lib/supabase"

export default function DevelopmentNotice() {
  const [isVisible, setIsVisible] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    // استخدام القيمة من ملف supabase.ts
    setConfigured(isSupabaseConfigured)
  }, [])

  if (!isVisible || configured) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm z-50 shadow-lg">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between p-3">
          <div className="flex-1 flex items-center justify-center">
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <strong className="font-semibold">وضع التطوير:</strong>
            <span className="mr-2">النظام يعمل ببيانات وهمية. جميع الوظائف متاحة للتجربة.</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mr-2 text-white/80 hover:text-white underline"
            >
              {showDetails ? "إخفاء التفاصيل" : "عرض التفاصيل"}
            </button>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-amber-200 ml-4 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {showDetails && (
          <div className="px-3 pb-3 text-xs bg-black/10">
            <div className="bg-white/10 rounded p-3 space-y-2">
              <p>
                <strong>للتفعيل الكامل:</strong>
              </p>
              <p>1. أنشئ مشروع جديد في Supabase</p>
              <p>2. أضف متغيرات البيئة في ملف .env.local:</p>
              <div className="bg-black/20 rounded p-2 mt-2 font-mono text-xs">
                <p>NEXT_PUBLIC_SUPABASE_URL=your_project_url</p>
                <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key</p>
              </div>
              <p>3. شغّل السكريبتات المطلوبة لإنشاء الجداول</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
