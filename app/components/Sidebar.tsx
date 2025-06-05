"use client"

import { useState } from "react"
import { Menu } from "@headlessui/react"
import { LogOut, MenuIcon } from "lucide-react"
import { useAuth } from "./AuthProvider"

export default function Sidebar() {
  const [language, setLanguage] = useState("العربية")
  const { userProfile, signOut } = useAuth()

  const handleWhatsAppConnect = () => {
    window.location.href = "/whatsapp-connect"
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = "/auth"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <nav className="flex flex-col justify-between h-full p-6">
      <div className="space-y-6">
        {/* Top Bar with Menu and Language */}
        <div className="flex items-center justify-between">
          {/* Hamburger Menu - Now on Right */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none">
              <MenuIcon className="w-6 h-6" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-left bg-white rounded-md shadow-lg border border-gray-100 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={`${
                        active ? "bg-gray-50 text-red-500" : "text-gray-700"
                      } flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <LogOut className="w-4 h-4 ml-2" />
                      تسجيل الخروج
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>

          {/* Language Selector - Now on Left */}
          <div className="flex items-center gap-2">
            <span className="text-lg">{language === "العربية" ? "🇸🇦" : "🇺🇸"}</span>
            <select
              className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>العربية</option>
              <option>English</option>
            </select>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900">{userProfile?.name || "المستخدم"}</div>
            <div className="text-sm text-gray-500">{userProfile?.email || "البريد الإلكتروني"}</div>
            {userProfile?.phone && <div className="text-xs text-gray-600">الجوال: {userProfile.phone}</div>}
          </div>

          {/* WhatsApp Connection Section */}
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">حالة واتساب:</span>
              <span
                className={`text-xs font-medium ${userProfile?.whatsapp_status ? "text-green-600" : "text-red-600"}`}
              >
                {userProfile?.whatsapp_status ? "✅ متصل" : "❌ غير متصل"}
              </span>
            </div>

            <button
              onClick={handleWhatsAppConnect}
              className="w-full inline-flex items-center justify-center text-green-600 hover:text-green-700 text-xs font-medium border border-green-500 rounded-lg px-3 py-2 transition-all duration-200 bg-white hover:bg-green-50 hover:shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 ml-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              {userProfile?.whatsapp_status ? "إعادة ربط" : "ربط واتساب"}
            </button>
          </div>
        </div>

        <a
          href="#"
          className="text-blue-500 text-xs hover:text-blue-700 transition-colors duration-200 underline mt-2 block text-center"
        >
          كيفية استخدام المنصة
        </a>
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center pt-6 border-t border-gray-100">
        <img src="/logo.svg" alt="BusinessChat" className="w-32 mb-6 opacity-90 hover:opacity-100 transition-opacity" />
      </div>
    </nav>
  )
}
