import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Profile, ServiceRecord } from "@/types";
import Image from "next/image";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/auth/signup");

  const { data: records } = await supabase
    .from("service_records")
    .select("*")
    .eq("knight_id", profile.id)
    .order("service_date", { ascending: false });

  const knight = profile as Profile;
  const serviceRecords = (records ?? []) as ServiceRecord[];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* 내 프로필 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>내 프로필</CardTitle>
          <Link href="/dashboard/profile/edit">
            <Button variant="outline" size="sm">
              수정
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={knight.avatar_url ?? undefined} />
              <AvatarFallback className="text-xl">
                {knight.nickname.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-semibold text-lg">{knight.nickname}</p>
              <p className="text-muted-foreground text-sm">{knight.character_name}</p>
              <div className="flex gap-2">
                <Badge>{knight.server_class}</Badge>
                <Badge variant="outline">Lv.{knight.level}</Badge>
              </div>
            </div>
          </div>
          {knight.description && (
            <p className="mt-3 text-sm text-muted-foreground">
              {knight.description}
            </p>
          )}
          <div className="mt-4">
            <Link href={`/knights/${knight.id}`}>
              <Button variant="secondary" size="sm">
                공개 프로필 보기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 쩔 이력 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            쩔 이력{" "}
            <span className="text-muted-foreground text-base font-normal">
              ({serviceRecords.length}건)
            </span>
          </h2>
          <Link href="/dashboard/records/new">
            <Button size="sm">+ 이력 추가</Button>
          </Link>
        </div>

        {serviceRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>아직 등록된 이력이 없습니다.</p>
              <Link href="/dashboard/records/new">
                <Button className="mt-4" variant="outline">
                  첫 이력 추가하기
                </Button>
              </Link>
            </CardContent>
          </Card>
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
                    <div className="grid grid-cols-3 gap-2">
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
