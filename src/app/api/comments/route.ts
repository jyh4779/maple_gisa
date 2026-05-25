import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recordId = searchParams.get("record_id");
  if (!recordId) return NextResponse.json({ error: "record_id 필요" }, { status: 400 });

  const supabase = await createClient();
  const { data: comments, error } = await supabase
    .from("record_comments")
    .select("*")
    .eq("record_id", recordId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const recordId = formData.get("record_id") as string;
  const authorName = (formData.get("author_name") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const imageFile = formData.get("image") as File | null;

  if (!recordId || !authorName || !content) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json({ error: "JPG, PNG, WEBP, GIF만 지원합니다." }, { status: 400 });
    }
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const path = `comments/${recordId}/${Date.now()}.${ext}`;
    const bytes = await imageFile.arrayBuffer();

    const { error: uploadError } = await adminSupabase.storage
      .from("service-records")
      .upload(path, Buffer.from(bytes), { contentType: imageFile.type });

    if (uploadError) {
      return NextResponse.json({ error: "이미지 업로드 실패" }, { status: 500 });
    }

    const { data: urlData } = adminSupabase.storage
      .from("service-records")
      .getPublicUrl(path);
    imageUrl = urlData.publicUrl;
  }

  const { data: comment, error } = await adminSupabase
    .from("record_comments")
    .insert({ record_id: recordId, author_name: authorName, content, image_url: imageUrl })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment });
}
