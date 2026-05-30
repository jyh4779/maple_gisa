import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Character } from "@/types";
import { CheckCircle, ShieldAlert, Plus } from "lucide-react";
import { getProfileByUserId } from "@/repositories/profiles";
import { getCharactersByProfileId } from "@/repositories/characters";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await getProfileByUserId(supabase, user.id);
  if (!profile) redirect("/auth/signup");

  const { data: characters } = await getCharactersByProfileId(supabase, profile.id);
  const chars = (characters ?? []) as Character[];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>내 계정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-lg">
                {profile.nickname.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold text-lg">{profile.nickname}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            내 캐릭터{" "}
            <span className="text-muted-foreground text-base font-normal">
              ({chars.length}개)
            </span>
          </h2>
          <Link href="/dashboard/characters/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              캐릭터 등록
            </Button>
          </Link>
        </div>

        {chars.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-2">
              <p className="font-medium">등록된 캐릭터가 없습니다.</p>
              <p className="text-sm text-muted-foreground">
                파티 지원기사로 활동하려면 캐릭터를 등록하고 인증을 받으세요.
              </p>
              <Link href="/dashboard/characters/new">
                <Button className="mt-2">
                  <Plus className="w-4 h-4 mr-1" />
                  캐릭터 등록하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {chars.map((char) => (
              <Card key={char.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{char.character_name}</p>
                        {char.is_verified && (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs shrink-0">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            인증됨
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{char.server_class}</Badge>
                        <Badge variant="outline">Lv.{char.level}</Badge>
                      </div>
                      {char.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {char.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      <Link href={`/knights/${char.id}`}>
                        <Button variant="ghost" size="sm">공개 프로필</Button>
                      </Link>
                      {!char.is_verified && (
                        <Link href={`/dashboard/characters/${char.id}/verify`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-600 border-amber-300 hover:bg-amber-50"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                            인증
                          </Button>
                        </Link>
                      )}
                      <Link href={`/dashboard/records/new?characterId=${char.id}`}>
                        <Button size="sm">이력 추가</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
