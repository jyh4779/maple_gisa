import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Star, Search } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center space-y-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">
          믿을 수 있는 파티 지원기사를 찾아보세요
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          메이플플래닛 파티 지원기사들의 실제 이력과 사진을 확인하고, 안전하게
          파티 지원 서비스를 이용하세요.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/knights">
            <Button size="lg">파티 지원기사 찾기</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline">
              파티 지원기사로 등록하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <Shield className="w-8 h-8 mx-auto text-primary" />
            <h3 className="font-semibold">검증된 이력</h3>
            <p className="text-sm text-muted-foreground">
              실제 파티 지원 완료 사진과 이력을 직접 업로드하여 신뢰도를 높여요.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <Search className="w-8 h-8 mx-auto text-primary" />
            <h3 className="font-semibold">쉬운 검색</h3>
            <p className="text-sm text-muted-foreground">
              직업, 레벨, 가격으로 조건에 맞는 파티 지원기사를 빠르게 찾을 수 있어요.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <Star className="w-8 h-8 mx-auto text-primary" />
            <h3 className="font-semibold">투명한 정보</h3>
            <p className="text-sm text-muted-foreground">
              파티 지원기사의 캐릭터 정보, 레벨, 서비스 내역을 한눈에 확인하세요.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
