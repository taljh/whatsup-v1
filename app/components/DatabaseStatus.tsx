"use client"

import { useState, useEffect } from "react"
import { isSupabaseConfigured } from "../../lib/supabase"

export default function DatabaseStatus() {
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    // استخدام القيمة من ملف supabase.ts
    setConfigured(isSupabaseConfigured)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${
          configured
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-amber-100 text-amber-800 border border-amber-200"
        }`}
      >
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className={`w-2 h-2 rounded-full ${configured ? "bg-green-500" : "bg-amber-500"} animate-pulse`}></div>
          <span>{configured ? "متصل بقاعدة البيانات" : "وضع التطوير"}</span>
        </div>
      </div>
    </div>
  )
}
