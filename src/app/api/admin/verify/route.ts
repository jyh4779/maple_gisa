import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { characterId, action } = await request.json() as {
    characterId: string;
    action: "approve" | "reject";
  };

  if (!characterId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  if (action === "approve") {
    const { error } = await adminSupabase
      .from("characters")
      .update({
        is_verified: true,
        verification_code: null,
        verification_expires_at: null,
        verification_screenshot_url: null,
      })
      .eq("id", characterId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    // 거절: 스크린샷만 삭제하여 재신청 가능 상태로
    const { data: char } = await adminSupabase
      .from("characters")
      .select("verification_screenshot_url")
      .eq("id", characterId)
      .single();

    if (char?.verification_screenshot_url) {
      await adminSupabase.storage
        .from("verifications")
        .remove([char.verification_screenshot_url]);
    }

    const { error } = await adminSupabase
      .from("characters")
      .update({ verification_screenshot_url: null })
      .eq("id", characterId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
