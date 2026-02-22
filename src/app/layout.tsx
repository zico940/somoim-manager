import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "소모임 관리자 시스템",
  description: "소모임 회원 데이터 관리 및 분석 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="antialiased flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 sm:p-8 mb-16 md:mb-0 overflow-y-auto w-full bg-slate-50 dark:bg-slate-900 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
