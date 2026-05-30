import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminVerifyList from "@/features/admin/AdminVerifyList";
import { getPendingVerificationCharacters } from "@/repositories/characters";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/");
  }

  const adminSupabase = createAdminClient();
  const { data: pending } = await getPendingVerificationCharacters(adminSupabase);

  const items = await Promise.all(
    (pending ?? []).map(async (char) => {
      const { data: signedUrl } = await adminSupabase.storage
        .from("verifications")
        .createSignedUrl(char.verification_screenshot_url!, 3600);

      return {
        ...char,
        profiles: char.profiles as unknown as { nickname: string },
        screenshotUrl: signedUrl?.signedUrl ?? null,
      };
    })
  );

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">관리자 — 인증 검토</h1>
        <Badge variant="secondary">대기 {items.length}건</Badge>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            검토 대기 중인 인증 신청이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{item.character_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {item.profiles?.nickname} · {item.server_class} Lv.{item.level}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">인증 코드</p>
                    <p className="font-mono font-bold text-lg tracking-widest">
                      {item.verification_code}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.screenshotUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.screenshotUrl}
                    alt="인증 스크린샷"
                    className="w-full rounded-lg border object-contain max-h-80"
                  />
                ) : (
                  <div className="w-full h-40 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    이미지를 불러올 수 없습니다
                  </div>
                )}
                <AdminVerifyList characterId={item.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
