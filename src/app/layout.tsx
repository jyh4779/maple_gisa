import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "메이플기사 - 파티 지원 서비스 검증 플랫폼",
  description:
    "메이플플래닛 파티 지원기사들의 이력을 확인하고 신뢰할 수 있는 파티원을 찾아보세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${geist.className} min-h-screen bg-background antialiased`}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <Toaster richColors />
      </body>
    </html>
  );
}
