import type React from "react"
import { Noto_Sans_Arabic } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "./components/AuthProvider"
import ProtectedLayout from "./components/ProtectedLayout"

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-sans-arabic",
  weight: ["400", "500", "600", "700"],
})

export const metadata = {
  title: "منصة متابعة السلات المتروكة",
  description: "نظام SaaS ذكي لاستعادة المبيعات المفقودة من خلال متابعة العملاء الذين يتركون سلات التسوق",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${notoSansArabic.variable} ${notoSansArabic.className}`}>
      <body className="bg-gray-100 rtl">
        <AuthProvider>
          <ProtectedLayout>{children}</ProtectedLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
