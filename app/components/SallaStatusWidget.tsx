"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/supabase"

interface SallaConnection {
  connected: boolean
  storeName?: string
  storeId?: string
  lastSync?: string
}

export default function SallaStatusWidget() {
  const [connection, setConnection] = useState<SallaConnection>({ connected: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConnection()
  }, [])

  const loadConnection = async () => {
    try {
      const { data } = await database.getSallaConnection()

      if (data) {
        setConnection({
          connected: true,
          storeName: data.store_name,
          storeId: data.store_id,
          lastSync: data.last_sync_at || data.updated_at,
        })
      }
    } catch (error) {
      console.error("Error loading Salla connection:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className={`w-3 h-3 rounded-full ${connection.connected ? "bg-green-500" : "bg-red-500"}`}></div>
          <h3 className="font-medium text-gray-900">حالة اتصال سلة</h3>
        </div>

        <span
          className={`text-xs px-2 py-1 rounded-full ${
            connection.connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {connection.connected ? "متصل" : "غير متصل"}
        </span>
      </div>

      {connection.connected ? (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">المتجر:</span>
            <span className="font-medium">{connection.storeName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">المعرف:</span>
            <span className="font-medium">{connection.storeId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">آخر مزامنة:</span>
            <span className="font-medium">
              {connection.lastSync ? new Date(connection.lastSync).toLocaleDateString("ar-SA") : "غير محدد"}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 mb-3">لم يتم ربط متجر سلة بعد</p>
          <a
            href="/salla-integration"
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-1 space-x-reverse"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span>ربط المتجر</span>
          </a>
        </div>
      )}
    </div>
  )
}
