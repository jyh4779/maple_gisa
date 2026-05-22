import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import type { Profile } from "@/types";

export default async function KnightsPage() {
  const supabase = await createClient();
  const { data: knights } = await supabase
    .from("profiles")
    .select("*")
    .order("level", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">쩔기사 목록</h1>
        <p className="text-muted-foreground text-sm mt-1">
          총 {knights?.length ?? 0}명의 쩔기사가 등록되어 있습니다.
        </p>
      </div>

      {!knights || knights.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          아직 등록된 쩔기사가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {knights.map((knight: Profile) => (
            <Link key={knight.id} href={`/knights/${knight.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={knight.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {knight.nickname.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{knight.nickname}</p>
                      <p className="text-sm text-muted-foreground">
                        {knight.character_name}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Badge variant="secondary">{knight.server_class}</Badge>
                    <Badge variant="outline">Lv.{knight.level}</Badge>
                  </div>
                  {knight.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {knight.description}
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
