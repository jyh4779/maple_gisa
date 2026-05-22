import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Profile, ServiceRecord } from "@/types";

export default async function KnightProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: knight }, { data: records }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase
      .from("service_records")
      .select("*")
      .eq("knight_id", id)
      .order("service_date", { ascending: false }),
  ]);

  if (!knight) notFound();

  const profile = knight as Profile;
  const serviceRecords = (records ?? []) as ServiceRecord[];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* 프로필 헤더 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-5">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl">
                {profile.nickname.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <div>
                <h1 className="text-2xl font-bold">{profile.nickname}</h1>
                <p className="text-muted-foreground">{profile.character_name}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge>{profile.server_class}</Badge>
                <Badge variant="outline">Lv.{profile.level}</Badge>
              </div>
              {profile.description && (
                <p className="text-sm text-muted-foreground">
                  {profile.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 쩔 이력 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          쩔 이력{" "}
          <span className="text-muted-foreground text-base font-normal">
            ({serviceRecords.length}건)
          </span>
        </h2>

        {serviceRecords.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            아직 등록된 이력이 없습니다.
          </p>
        ) : (
          <div className="space-y-4">
            {serviceRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{record.title}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {new Date(record.service_date).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-4 text-sm">
                    <span>
                      레벨:{" "}
                      <span className="font-medium">
                        {record.client_level_before} → {record.client_level_after}
                      </span>
                    </span>
                    <span>
                      비용:{" "}
                      <span className="font-medium">
                        {record.price.toLocaleString()}메소
                      </span>
                    </span>
                  </div>
                  {record.description && (
                    <p className="text-sm text-muted-foreground">
                      {record.description}
                    </p>
                  )}
                  {record.image_urls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {record.image_urls.map((url, i) => (
                        <div
                          key={i}
                          className="relative aspect-video rounded-md overflow-hidden bg-muted"
                        >
                          <Image
                            src={url}
                            alt={`이력 사진 ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
