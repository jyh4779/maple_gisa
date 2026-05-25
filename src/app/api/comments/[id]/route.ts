import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const STORAGE_PUBLIC_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/service-records/`;

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: comment } = await supabase
    .from("record_comments")
    .select("id, image_url")
    .eq("id", id)
    .single();

  if (!comment) return NextResponse.json({ error: "댓글 없음" }, { status: 404 });

  // RLS가 소유권 검증 (이력 소유자만 삭제 가능)
  const { error } = await supabase.from("record_comments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 첨부 이미지 storage 삭제
  if (comment.image_url) {
    const path = comment.image_url.replace(STORAGE_PUBLIC_PREFIX, "");
    const adminSupabase = createAdminClient();
    await adminSupabase.storage.from("service-records").remove([path]);
  }

  return NextResponse.json({ success: true });
}
