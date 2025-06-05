"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/supabase"

interface SallaStatus {
  connected: boolean
  storeName?: string
  storeId?: string
  lastSync?: string
  connectionId?: string
}

interface ConnectionStats {
  totalCarts: number
  messagesSent: number
  recoveredCarts: number
  recoveryRate: number
}

export default function SallaIntegrationPage() {
  const [status, setStatus] = useState<SallaStatus>({ connected: false })
  const [stats, setStats] = useState<ConnectionStats>({
    totalCarts: 0,
    messagesSent: 0,
    recoveredCarts: 0,
    recoveryRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [testingWebhook, setTestingWebhook] = useState(false)

  useEffect(() => {
    loadSallaStatus()
    loadStats()
  }, [])

  const loadSallaStatus = async () => {
    try {
      const { data: connection } = await database.getSallaConnection()

      if (connection) {
        setStatus({
          connected: true,
          storeName: connection.store_name,
          storeId: connection.store_id,
          lastSync: connection.last_sync_at || connection.updated_at,
          connectionId: connection.id,
        })
      }
    } catch (error) {
      console.error("Error loading Salla status:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const { data: carts } = await database.getAbandonedCarts()

      if (carts) {
        const totalCarts = carts.length
        const messagesSent = carts.filter((cart) => cart.first_reminder_sent || cart.second_reminder_sent).length
        const recoveredCarts = carts.filter((cart) => cart.status === "recovered").length
        const recoveryRate = totalCarts > 0 ? Math.round((recoveredCarts / totalCarts) * 100) : 0

        setStats({
          totalCarts,
          messagesSent,
          recoveredCarts,
          recoveryRate,
        })
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const testWebhook = async () => {
    setTestingWebhook(true)
    try {
      const response = await fetch("/api/webhooks/salla", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: "app.store.authorize",
          data: {
            store_id: "test_store_123",
            access_token: "test_access_token",
            refresh_token: "test_refresh_token",
            expires_in: 31536000,
            store: {
              name: "متجر اختبار",
              url: "https://test-store.mysalla.com",
            },
            merchant: {
              name: "تاجر تجريبي",
              email: "test@example.com",
              mobile: "+966501234567",
            },
          },
        }),
      })

      const result = await response.json()

      if (response.ok) {
        alert("✅ تم اختبار الـ webhook بنجاح!")
        loadSallaStatus()
      } else {
        alert(`❌ خطأ في اختبار الـ webhook: ${result.message}`)
      }
    } catch (error) {
      alert(`❌ خطأ في الاتصال: ${error}`)
    } finally {
      setTestingWebhook(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8 h-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تكامل سلة</h1>
          <p className="text-gray-600 mt-1">إدارة اتصال متجرك مع منصة سلة</p>
        </div>

        <button
          onClick={testWebhook}
          disabled={testingWebhook}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 space-x-reverse"
        >
          {testingWebhook ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          <span>{testingWebhook ? "جاري الاختبار..." : "اختبار الـ Webhook"}</span>
        </button>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">حالة الاتصال</h3>
          <div
            className={`flex items-center space-x-2 space-x-reverse px-3 py-1 rounded-full text-sm ${
              status.connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${status.connected ? "bg-green-500" : "bg-red-500"}`}></div>
            <span>{status.connected ? "متصل" : "غير متصل"}</span>
          </div>
        </div>

        {status.connected ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">اسم المتجر</p>
              <p className="font-medium text-gray-900">{status.storeName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">معرف المتجر</p>
              <p className="font-medium text-gray-900">{status.storeId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">آخر مزامنة</p>
              <p className="font-medium text-gray-900">
                {status.lastSync ? new Date(status.lastSync).toLocaleString("ar-SA") : "غير محدد"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">لم يتم ربط متجر سلة بعد</h4>
            <p className="text-gray-600 mb-4">قم بتثبيت التطبيق في متجرك على سلة لبدء استخدام الخدمة</p>
            <a
              href="https://salla.dev/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 space-x-2 space-x-reverse"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span>انتقل إلى لوحة تحكم سلة</span>
            </a>
          </div>
        )}
      </div>

      {/* Statistics */}
      {status.connected && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">السلات المتروكة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCarts}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الرسائل المرسلة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.messagesSent}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">المبيعات المستردة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recoveredCarts}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">معدل الاسترداد</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recoveryRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integration Guide */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">دليل التكامل</h3>

        <div className="space-y-4">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">تسجيل التطبيق في سلة</h4>
              <p className="text-sm text-gray-600">اذهب إلى لوحة تحكم مطوري سلة وأنشئ تطبيقاً جديداً</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">إعداد الـ Webhook</h4>
              <p className="text-sm text-gray-600">أضف عنوان الـ webhook في إعدادات التطبيق:</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">
                {typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/webhooks/salla
              </code>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">إعداد متغيرات البيئة</h4>
              <p className="text-sm text-gray-600">أضف CLIENT_ID و CLIENT_SECRET في ملف .env.local</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">تثبيت التطبيق</h4>
              <p className="text-sm text-gray-600">قم بتثبيت التطبيق في متجرك وسيتم الربط تلقائياً</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
