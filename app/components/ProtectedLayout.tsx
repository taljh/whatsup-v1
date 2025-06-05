"use client"

import type React from "react"
import { useAuth } from "./AuthProvider"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import Sidebar from "./Sidebar"
import { isSupabaseConfigured } from "../../lib/supabase"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // الصفحات التي لا تحتاج مصادقة
  const publicPages = ["/auth"]
  const isPublicPage = publicPages.includes(pathname)

  useEffect(() => {
    // إذا لم يكن Supabase مكوناً، السماح بالوصول للجميع
    if (!isSupabaseConfigured) {
      console.log("Supabase not configured - allowing access to all pages")
      return
    }

    // إذا انتهى التحميل ولم يكن المستخدم مسجل دخول وليس في صفحة عامة
    if (!loading && !user && !isPublicPage) {
      console.log("Redirecting to auth page - no user and not public page")
      router.push("/auth")
    }

    // إذا كان المستخدم مسجل دخول وفي صفحة المصادقة
    if (!loading && user && isPublicPage) {
      console.log("Redirecting to home page - user is authenticated but on auth page")
      router.push("/")
    }
  }, [user, loading, isPublicPage, router])

  // شاشة التحميل
  if (loading && isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <svg
              className="animate-spin w-8 h-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">جاري التحميل...</h2>
          <p className="text-gray-600">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    )
  }

  // إذا كان في صفحة عامة، عرض المحتوى مباشرة
  if (isPublicPage) {
    return <>{children}</>
  }

  // إذا لم يكن Supabase مكوناً، السماح بالوصول مع إشعار
  if (!isSupabaseConfigured) {
    return (
      <div className="app-container">
        <div className="layout-container">
          {/* الكرت الأيمن - القائمة الجانبية */}
          <div className="card w-80 shrink-0">
            <Sidebar />
          </div>
          {/* الكرت الأيسر - المحتوى الرئيسي */}
          <div className="card flex-1">
            <main className="h-full">{children}</main>
          </div>
        </div>
      </div>
    )
  }

  // إذا لم يكن المستخدم مسجل دخول، عرض رسالة
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">غير مصرح بالوصول</h2>
          <p className="text-gray-600 mb-6">يرجى تسجيل الدخول للوصول إلى هذه الصفحة</p>
          <button
            onClick={() => router.push("/auth")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    )
  }

  // عرض التخطيط الكامل للصفحات المحمية
  return (
    <div className="app-container">
      <div className="layout-container">
        {/* الكرت الأيمن - القائمة الجانبية */}
        <div className="card w-80 shrink-0">
          <Sidebar />
        </div>
        {/* الكرت الأيسر - المحتوى الرئيسي */}
        <div className="card flex-1">
          <main className="h-full">{children}</main>
        </div>
      </div>
    </div>
  )
}
