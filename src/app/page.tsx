import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, Search, Clock } from "lucide-react";
import RegisterButton from "@/components/RegisterButton";

const MOCK_SLOTS = [
  {
    knight: "어둠의검사",
    serverClass: "도적",
    level: 185,
    slots: ["오늘 14:00", "오늘 17:00", "내일 10:00"],
    price: "15,000,000",
  },
  {
    knight: "달빛전사",
    serverClass: "전사",
    level: 220,
    slots: ["오늘 20:00", "내일 13:00"],
    price: "20,000,000",
  },
  {
    knight: "별빛마법사",
    serverClass: "마법사",
    level: 195,
    slots: ["오늘 16:00", "오늘 19:00", "내일 11:00"],
    price: "12,000,000",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 px-8 py-20 text-center space-y-6 text-white">
        <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-500/30 hover:bg-indigo-500/20">
          메이플플래닛 공식 지원기사 플랫폼
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          검증된 기사, 바로 예약
        </h1>
        <p className="text-indigo-200 text-lg max-w-lg mx-auto leading-relaxed">
          파티 지원기사의 실제 이력을 확인하고
          <br />
          빈 시간대를 바로 예약하세요.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link href="/knights">
            <Button size="lg" className="bg-indigo-500 hover:bg-indigo-400 text-white">
              기사 찾아보기
            </Button>
          </Link>
          <RegisterButton />
        </div>
      </section>

      {/* 예약 가능 시간대 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">지금 예약 가능한 기사</h2>
            <p className="text-sm text-muted-foreground mt-0.5">실시간으로 업데이트되는 빈 시간대</p>
          </div>
          <Badge variant="secondary" className="gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            실시간
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_SLOTS.map((item) => (
            <Card key={item.knight} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{item.knight}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.serverClass} · Lv.{item.level}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-indigo-600">
                    {item.price}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.slots.map((slot) => (
                    <Badge key={slot} variant="outline" className="gap-1 text-xs">
                      <Clock className="w-3 h-3" />
                      {slot}
                    </Badge>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="w-full" disabled>
                  예약하기 (출시 예정)
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold">검증된 이력</h3>
            <p className="text-sm text-muted-foreground">
              실제 파티 지원 완료 사진과 이력을 직접 업로드해 신뢰도를 높여요.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold">빠른 검색</h3>
            <p className="text-sm text-muted-foreground">
              직업·레벨·가격·시간대로 조건에 맞는 기사를 바로 찾을 수 있어요.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="font-semibold">투명한 정보</h3>
            <p className="text-sm text-muted-foreground">
              기사의 캐릭터 정보, 레벨, 서비스 내역을 한눈에 확인하세요.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
