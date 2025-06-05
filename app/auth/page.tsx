"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../components/AuthProvider"
import { useRouter } from "next/navigation"
import { isSupabaseConfigured } from "../../lib/supabase"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { signIn, signUp, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // إذا كان المستخدم مسجل دخول، انتقل إلى الصفحة الرئيسية
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // التحقق من تكوين Supabase
    if (!isSupabaseConfigured) {
      setError("قاعدة البيانات غير مكونة. يرجى تكوين متغيرات البيئة أولاً.")
      setLoading(false)
      return
    }

    // التحقق من صحة البيانات
    if (!email || !password) {
      setError("يرجى ملء جميع الحقول المطلوبة")
      setLoading(false)
      return
    }

    if (!isLogin && !name) {
      setError("يرجى إدخال الاسم الكامل")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        console.log("Attempting to sign in")
        const { error: signInError } = await signIn(email, password)

        if (signInError) {
          console.error("Sign in error:", signInError)
          setError(signInError.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة")
        } else {
          setSuccess("تم تسجيل الدخول بنجاح!")
          setTimeout(() => {
            router.push("/")
          }, 1000)
        }
      } else {
        console.log("Attempting to sign up")
        const { error: signUpError } = await signUp(email, password, name)

        if (signUpError) {
          console.error("Sign up error:", signUpError)
          setError(signUpError.message || "حدث خطأ في إنشاء الحساب. يرجى المحاولة مرة أخرى")
        } else {
          setSuccess("تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني لتفعيل الحساب")
          setTimeout(() => {
            setIsLogin(true)
            setEmail("")
            setPassword("")
            setName("")
            setSuccess("")
          }, 3000)
        }
      }
    } catch (error: any) {
      console.error("Unexpected error:", error)
      setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                ></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{isLogin ? "مرحباً بعودتك" : "انضم إلينا"}</h1>
            <p className="text-gray-600 text-sm">
              {isLogin ? "سجل دخولك للوصول إلى لوحة التحكم" : "أنشئ حسابك الجديد وابدأ في استعادة المبيعات المفقودة"}
            </p>

            {/* Database Status Notice */}
            {!isSupabaseConfigured && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-xs">
                <div className="flex items-center">
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>قاعدة البيانات غير مكونة. يرجى تكوين متغيرات البيئة.</span>
                </div>
              </div>
            )}

            {isSupabaseConfigured && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg text-xs">
                <div className="flex items-center">
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>متصل بقاعدة البيانات - جاهز للاستخدام</span>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="example@domain.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                كلمة المرور
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="••••••••"
              />
              {!isLogin && <p className="text-xs text-gray-500">كلمة المرور يجب أن تكون 6 أحرف على الأقل</p>}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {success}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md"
            >
              {loading ? (
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
                  {isLogin ? "جاري تسجيل الدخول..." : "جاري إنشاء الحساب..."}
                </span>
              ) : !isSupabaseConfigured ? (
                "قاعدة البيانات غير مكونة"
              ) : isLogin ? (
                "تسجيل الدخول"
              ) : (
                "إنشاء حساب جديد"
              )}
            </button>
          </form>

          {/* Toggle between Login/Register */}
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">أو</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
                setSuccess("")
                setEmail("")
                setPassword("")
                setName("")
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
            >
              {isLogin ? "ليس لديك حساب؟ أنشئ حساباً جديداً" : "لديك حساب؟ سجل دخولك"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">منصة استعادة السلات المتروكة © 2024</p>
        </div>
      </div>
    </div>
  )
}
