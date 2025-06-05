import Sidebar from "./components/Sidebar";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-sans-arabic",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "منصة متابعة السلات المتروكة",
  description: "استرداد المبيعات المفقودة من خلال متابعة العملاء الذين يتركون سلات التسوق",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${notoSansArabic.variable} ${notoSansArabic.className}`}>
      <body className="bg-gray-100 rtl">
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
      </body>
    </html>
  );
}
