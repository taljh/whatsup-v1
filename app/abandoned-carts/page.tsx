"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/supabase"

interface AbandonedCart {
  id: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  total_amount: number
  currency: string
  status: "pending" | "recovered" | "expired"
  first_reminder_sent: boolean
  second_reminder_sent: boolean
  first_reminder_sent_at?: string
  second_reminder_sent_at?: string
  recovered_at?: string
  created_at: string
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [sendingReminders, setSendingReminders] = useState(false)

  useEffect(() => {
    loadCarts()
  }, [])

  const loadCarts = async () => {
    setLoading(true)
    try {
      const { data } = await database.getAbandonedCarts()
      setCarts(data || [])
    } catch (error) {
      console.error("Error loading carts:", error)
    } finally {
      setLoading(false)
    }
  }

  const syncCarts = async () => {
    setSyncing(true)
    try {
      const response = await fetch("/api/carts/sync", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}`,
        },
      })
      const result = await response.json()

      if (result.success) {
        alert(`تم مزامنة السلات بنجاح! تم العثور على ${result.totalCarts} سلة، تم حفظ ${result.savedCarts} سلة جديدة.`)
        loadCarts()
      } else {
        alert(`فشل في مزامنة السلات: ${result.message}`)
      }
    } catch (error) {
      console.error("Error syncing carts:", error)
      alert("حدث خطأ أثناء مزامنة السلات")
    } finally {
      setSyncing(false)
    }
  }

  const sendReminders = async () => {
    setSendingReminders(true)
    try {
      const response = await fetch("/api/carts/send-reminders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}`,
        },
      })
      const result = await response.json()

      if (result.success) {
        alert(
          `تم إرسال التذكيرات بنجاح! تم إرسال ${result.firstRemindersSent} تذكير أول و ${result.secondRemindersSent} تذكير ثاني.`,
        )
        loadCarts()
      } else {
        alert(`فشل في إرسال التذكيرات: ${result.message}`)
      }
    } catch (error) {
      console.error("Error sending reminders:", error)
      alert("حدث خطأ أثناء إرسال التذكيرات")
    } finally {
      setSendingReminders(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير متوفر"
    return new Date(dateString).toLocaleString("ar-SA")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">معلقة</span>
      case "recovered":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">مستردة</span>
      case "expired":
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">منتهية</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>
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
          <h1 className="text-2xl font-bold text-gray-900">السلات المتروكة</h1>
          <p className="text-gray-600 mt-1">إدارة ومتابعة السلات المتروكة من متجرك</p>
        </div>

        <div className="flex space-x-4 space-x-reverse">
          <button
            onClick={sendReminders}
            disabled={sendingReminders}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2 space-x-reverse"
          >
            {sendingReminders ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            )}
            <span>{sendingReminders ? "جاري الإرسال..." : "إرسال التذكيرات"}</span>
          </button>

          <button
            onClick={syncCarts}
            disabled={syncing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 space-x-reverse"
          >
            {syncing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            <span>{syncing ? "جاري المزامنة..." : "مزامنة السلات"}</span>
          </button>
        </div>
      </div>

      {/* Carts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {carts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سلات متروكة</h3>
            <p className="text-gray-500 mb-6">قم بمزامنة السلات من متجرك على سلة للبدء</p>
            <button
              onClick={syncCarts}
              disabled={syncing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center space-x-2 space-x-reverse"
            >
              {syncing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              <span>{syncing ? "جاري المزامنة..." : "مزامنة السلات"}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    العميل
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    المبلغ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    الحالة
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    التذكير الأول
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    التذكير الثاني
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    تاريخ الإنشاء
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {carts.map((cart) => (
                  <tr key={cart.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cart.customer_name}</div>
                      <div className="text-sm text-gray-500">{cart.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {cart.total_amount} {cart.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(cart.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cart.first_reminder_sent ? (
                        <div>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">تم الإرسال</span>
                          <div className="text-xs text-gray-500 mt-1">{formatDate(cart.first_reminder_sent_at)}</div>
                        </div>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">لم يرسل</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cart.second_reminder_sent ? (
                        <div>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">تم الإرسال</span>
                          <div className="text-xs text-gray-500 mt-1">{formatDate(cart.second_reminder_sent_at)}</div>
                        </div>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">لم يرسل</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(cart.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
