import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import type { Character } from "@/types";
import { CheckCircle } from "lucide-react";

export default async function KnightsPage() {
  const supabase = await createClient();
  const { data: characters } = await supabase
    .from("characters")
    .select("*, profiles(nickname, avatar_url)")
    .order("level", { ascending: false });

  const chars = (characters ?? []) as (Character & {
    profiles: { nickname: string; avatar_url: string | null };
  })[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">파티 지원기사 목록</h1>
        <p className="text-muted-foreground text-sm mt-1">
          총 {chars.length}개의 캐릭터가 등록되어 있습니다.
        </p>
      </div>

      {chars.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          아직 등록된 파티 지원기사가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {chars.map((char) => (
            <Link key={char.id} href={`/knights/${char.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={char.profiles?.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {char.profiles?.nickname.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{char.character_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {char.profiles?.nickname}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">{char.server_class}</Badge>
                    <Badge variant="outline">Lv.{char.level}</Badge>
                    {char.is_verified && (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        인증됨
                      </Badge>
                    )}
                  </div>
                  {char.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {char.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
