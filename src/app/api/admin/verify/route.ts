import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { approveCharacter, getCharacterScreenshotPath, rejectCharacter } from "@/repositories/characters";

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
    const { error } = await approveCharacter(adminSupabase, characterId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { data: char } = await getCharacterScreenshotPath(adminSupabase, characterId);

    if (char?.verification_screenshot_url) {
      await adminSupabase.storage
        .from("verifications")
        .remove([char.verification_screenshot_url]);
    }

    const { error } = await rejectCharacter(adminSupabase, characterId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
