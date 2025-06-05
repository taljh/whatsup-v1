"use client"

import { useState, useEffect } from "react"

interface SallaConnectionStatus {
  connected: boolean
  storeName?: string
  storeId?: string
  lastSync?: string
}

export default function SallaStatus() {
  const [status, setStatus] = useState<SallaConnectionStatus>({
    connected: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // في التطبيق الحقيقي، سنقوم بجلب حالة الاتصال من API
    const fetchSallaStatus = async () => {
      try {
        // محاكاة طلب API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // بيانات تجريبية
        setStatus({
          connected: true,
          storeName: "متجر الأمثلة",
          storeId: "123456",
          lastSync: new Date().toISOString(),
        })
      } catch (error) {
        console.error("خطأ في جلب حالة اتصال سلة:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSallaStatus()
  }, [])

  if (loading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="animate-pulse flex space-x-4 space-x-reverse">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className={`w-3 h-3 rounded-full ${status.connected ? "bg-green-500" : "bg-red-500"}`}></div>
          <h3 className="font-medium">حالة اتصال سلة</h3>
        </div>

        {status.connected ? (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">متصل</span>
        ) : (
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">غير متصل</span>
        )}
      </div>

      {status.connected && (
        <div className="mt-3 text-sm space-y-1">
          <p>
            <span className="text-gray-500">اسم المتجر:</span> {status.storeName}
          </p>
          <p>
            <span className="text-gray-500">معرف المتجر:</span> {status.storeId}
          </p>
          <p>
            <span className="text-gray-500">آخر مزامنة:</span> {new Date(status.lastSync!).toLocaleString("ar-SA")}
          </p>
        </div>
      )}

      {!status.connected && (
        <div className="mt-3">
          <a href="#" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            ربط متجر سلة
          </a>
        </div>
      )}
    </div>
  )
}
