import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MapleTrust - 파티 지원 예약 & 검증 플랫폼",
  description:
    "메이플플래닛 파티 지원기사의 검증된 이력을 확인하고, 빈 시간대를 바로 예약하세요.",
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
