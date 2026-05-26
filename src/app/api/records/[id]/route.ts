import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const STORAGE_PUBLIC_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/service-records/`;

function urlToPath(url: string) {
  return url.replace(STORAGE_PUBLIC_PREFIX, "");
}

async function checkOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  recordId: string,
  userId: string
): Promise<{ record: { id: string; image_urls: string[]; character_id: string } | null; authorized: boolean }> {
  const { data: record } = await supabase
    .from("service_records")
    .select("id, image_urls, character_id")
    .eq("id", recordId)
    .single();

  if (!record) return { record: null, authorized: false };

  const { data: character } = await supabase
    .from("characters")
    .select("profile_id")
    .eq("id", record.character_id)
    .single();

  if (!character) return { record, authorized: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("id", character.profile_id)
    .single();

  return { record, authorized: profile?.user_id === userId };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { record, authorized } = await checkOwnership(supabase, id, user.id);
  if (!record) return NextResponse.json({ error: "이력을 찾을 수 없습니다." }, { status: 404 });
  if (!authorized) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  const formData = await request.formData();
  const dataRaw = formData.get("data") as string;
  const fields = JSON.parse(dataRaw) as {
    title: string;
    description: string | null;
    client_nickname: string | null;
    price: number;
    service_date: string;
    exp_gained: number | null;
    hunt_duration_minutes: number | null;
    hunting_ground: string | null;
    keepImageUrls: string[];
  };

  // 삭제된 이미지 storage에서 제거
  const deletedUrls = (record.image_urls as string[]).filter(
    (u) => !fields.keepImageUrls.includes(u)
  );
  if (deletedUrls.length > 0) {
    const adminSupabase = createAdminClient();
    await adminSupabase.storage
      .from("service-records")
      .remove(deletedUrls.map(urlToPath));
  }

  // 새 이미지 업로드
  const newImageUrls: string[] = [];
  const imageFiles = formData.getAll("images") as File[];
  for (const file of imageFiles) {
    if (!file.size) continue;
    const ext = file.name.split(".").pop();
    const path = `${record.character_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("service-records")
      .upload(path, Buffer.from(bytes), { contentType: file.type });
    if (uploadError) return NextResponse.json({ error: "이미지 업로드 실패: " + uploadError.message }, { status: 500 });
    const { data: urlData } = supabase.storage.from("service-records").getPublicUrl(path);
    newImageUrls.push(urlData.publicUrl);
  }

  const finalImageUrls = [...fields.keepImageUrls, ...newImageUrls];

  // 소유권은 checkOwnership에서 이미 확인했으므로 admin client로 RLS 우회
  const adminSupabase = createAdminClient();
  const { data: rows, error } = await adminSupabase
    .from("service_records")
    .update({
      title: fields.title,
      description: fields.description,
      client_nickname: fields.client_nickname,
      price: fields.price,
      service_date: fields.service_date,
      exp_gained: fields.exp_gained,
      hunt_duration_minutes: fields.hunt_duration_minutes,
      hunting_ground: fields.hunting_ground,
      image_urls: finalImageUrls,
    })
    .eq("id", id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rows || rows.length === 0) return NextResponse.json({ error: "수정에 실패했습니다." }, { status: 500 });
  return NextResponse.json({ record: rows[0] });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { record, authorized } = await checkOwnership(supabase, id, user.id);
  if (!record) return NextResponse.json({ error: "이력을 찾을 수 없습니다." }, { status: 404 });
  if (!authorized) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  const urls = record.image_urls as string[];
  if (urls.length > 0) {
    const adminSupabase = createAdminClient();
    await adminSupabase.storage.from("service-records").remove(urls.map(urlToPath));
  }

  const { error } = await supabase.from("service_records").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
