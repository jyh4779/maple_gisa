import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAllCharactersWithProfiles(supabase: SupabaseClient) {
  return supabase
    .from("characters")
    .select("*, profiles(nickname, avatar_url)")
    .order("level", { ascending: false });
}

export async function getCharacterWithProfileById(supabase: SupabaseClient, id: string) {
  return supabase
    .from("characters")
    .select("*, profiles(nickname, avatar_url, user_id)")
    .eq("id", id)
    .single();
}

export async function getCharactersByProfileId(supabase: SupabaseClient, profileId: string) {
  return supabase
    .from("characters")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true });
}

export async function getCharacterForVerification(supabase: SupabaseClient, id: string) {
  return supabase
    .from("characters")
    .select("id, is_verified, verification_code, verification_expires_at, verification_screenshot_url, profiles(user_id)")
    .eq("id", id)
    .single();
}

export async function getCharacterProfileId(supabase: SupabaseClient, characterId: string) {
  return supabase
    .from("characters")
    .select("profile_id")
    .eq("id", characterId)
    .single();
}

export async function createCharacter(supabase: SupabaseClient, data: {
  profile_id: string;
  character_name: string;
  server_class: string;
  level: number;
  description: string | null;
  active_times: string[];
  preferred_hunting_grounds: string[];
}) {
  return supabase.from("characters").insert(data);
}

export async function updateVerificationCode(supabase: SupabaseClient, id: string, code: string, expiresAt: string) {
  return supabase
    .from("characters")
    .update({ verification_code: code, verification_expires_at: expiresAt })
    .eq("id", id);
}

export async function updateVerificationScreenshot(adminSupabase: SupabaseClient, id: string, path: string) {
  return adminSupabase
    .from("characters")
    .update({ verification_screenshot_url: path })
    .eq("id", id);
}

export async function getPendingVerificationCharacters(adminSupabase: SupabaseClient) {
  return adminSupabase
    .from("characters")
    .select("id, character_name, level, server_class, verification_code, verification_screenshot_url, profiles(nickname)")
    .not("verification_screenshot_url", "is", null)
    .eq("is_verified", false)
    .order("created_at", { ascending: true });
}

export async function approveCharacter(adminSupabase: SupabaseClient, id: string) {
  return adminSupabase
    .from("characters")
    .update({
      is_verified: true,
      verification_code: null,
      verification_expires_at: null,
      verification_screenshot_url: null,
    })
    .eq("id", id);
}

export async function getCharacterScreenshotPath(adminSupabase: SupabaseClient, id: string) {
  return adminSupabase
    .from("characters")
    .select("verification_screenshot_url")
    .eq("id", id)
    .single();
}

export async function rejectCharacter(adminSupabase: SupabaseClient, id: string) {
  return adminSupabase
    .from("characters")
    .update({ verification_screenshot_url: null })
    .eq("id", id);
}
