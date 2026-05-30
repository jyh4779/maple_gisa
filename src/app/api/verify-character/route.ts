import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getCharacterForVerification,
  updateVerificationCode,
  updateVerificationScreenshot,
} from "@/repositories/characters";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get("characterId");
  if (!characterId) return NextResponse.json({ error: "characterId가 필요합니다." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: character } = await getCharacterForVerification(supabase, characterId);
  if (!character) return NextResponse.json({ error: "캐릭터를 찾을 수 없습니다." }, { status: 404 });

  const profile = character.profiles as unknown as { user_id: string };
  if (profile.user_id !== user.id) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  if (character.is_verified) return NextResponse.json({ verified: true });
  if (character.verification_screenshot_url) return NextResponse.json({ pending: true });

  const isExpired =
    !character.verification_code ||
    !character.verification_expires_at ||
    new Date(character.verification_expires_at) < new Date();

  if (isExpired) {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await updateVerificationCode(supabase, characterId, code, expiresAt);
    return NextResponse.json({ code, expiresAt });
  }

  return NextResponse.json({
    code: character.verification_code,
    expiresAt: character.verification_expires_at,
  });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get("characterId");
  if (!characterId) return NextResponse.json({ error: "characterId가 필요합니다." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: character } = await getCharacterForVerification(supabase, characterId);
  if (!character) return NextResponse.json({ error: "캐릭터를 찾을 수 없습니다." }, { status: 404 });

  const profile = character.profiles as unknown as { user_id: string };
  if (profile.user_id !== user.id) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  if (character.is_verified) return NextResponse.json({ success: true, alreadyVerified: true });

  if (!character.verification_code || new Date(character.verification_expires_at!).getTime() < Date.now()) {
    return NextResponse.json({ error: "인증 코드가 만료되었습니다. 새 코드를 발급받으세요." }, { status: 400 });
  }

  const formData = await request.formData();
  const imageFile = formData.get("image") as File | null;
  if (!imageFile) return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(imageFile.type)) {
    return NextResponse.json({ error: "JPG, PNG, WEBP, GIF 형식만 지원합니다." }, { status: 400 });
  }

  const ext = imageFile.name.split(".").pop() ?? "png";
  const path = `${characterId}/${Date.now()}.${ext}`;
  const bytes = await imageFile.arrayBuffer();

  const adminSupabase = createAdminClient();
  const { error: uploadError } = await adminSupabase.storage
    .from("verifications")
    .upload(path, Buffer.from(bytes), { contentType: imageFile.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: "이미지 업로드 실패: " + uploadError.message }, { status: 500 });
  }

  const { error: updateError } = await updateVerificationScreenshot(adminSupabase, characterId, path);
  if (updateError) {
    return NextResponse.json({ error: "저장 실패: " + updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, pending: true });
}
