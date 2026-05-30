import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Character, ServiceRecord } from "@/types";
import RecordTimeline from "@/features/records/RecordTimeline";
import { getCharacterWithProfileById } from "@/repositories/characters";
import { getServiceRecordsByCharacterId } from "@/repositories/serviceRecords";

export default async function KnightProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: charData }, { data: records }] = await Promise.all([
    getCharacterWithProfileById(supabase, id),
    getServiceRecordsByCharacterId(supabase, id),
  ]);

  if (!charData) notFound();

  const char = charData as Character & {
    profiles: { nickname: string; avatar_url: string | null; user_id: string };
  };
  const serviceRecords = (records ?? []) as ServiceRecord[];
  const isOwner = user?.id === char.profiles?.user_id;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-5">
            <Avatar className="w-16 h-16">
              <AvatarImage src={char.profiles?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xl">
                {char.profiles?.nickname.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <div>
                <h1 className="text-2xl font-bold">{char.character_name}</h1>
                <p className="text-sm text-muted-foreground">{char.profiles?.nickname}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">{char.server_class}</Badge>
                {char.job && <Badge>{char.job}</Badge>}
                <Badge variant="outline">Lv.{char.level}</Badge>
                {char.is_verified && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    인증됨
                  </Badge>
                )}
              </div>
              {char.description && (
                <p className="text-sm text-muted-foreground">{char.description}</p>
              )}
            </div>
          </div>

          {serviceRecords.length > 0 && (
            <div className="mt-5 pt-4 border-t grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{serviceRecords.length}</p>
                <p className="text-xs text-muted-foreground">총 이력</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(serviceRecords.reduce((sum, r) => sum + r.price, 0) / 100_000_000).toFixed(1)}억
                </p>
                <p className="text-xs text-muted-foreground">총 수익</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {serviceRecords.filter((r) => r.image_urls.length > 0).length}
                </p>
                <p className="text-xs text-muted-foreground">사진 있는 이력</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            파티 지원 이력{" "}
            <span className="text-muted-foreground text-base font-normal">
              ({serviceRecords.length}건)
            </span>
          </h2>
          {isOwner && (
            <Link
              href={`/dashboard/records/new?characterId=${id}`}
              className={buttonVariants({ size: "sm" })}
            >
              <Plus className="w-4 h-4 mr-1" />
              이력 추가
            </Link>
          )}
        </div>
        <RecordTimeline records={serviceRecords} isOwner={isOwner} />
      </div>
    </div>
  );
}
