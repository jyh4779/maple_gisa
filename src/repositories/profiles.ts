import type { SupabaseClient } from "@supabase/supabase-js";

export async function getProfileByUserId(supabase: SupabaseClient, userId: string) {
  return supabase.from("profiles").select("*").eq("user_id", userId).single();
}

export async function getProfileIdByUserId(supabase: SupabaseClient, userId: string) {
  return supabase.from("profiles").select("id").eq("user_id", userId).single();
}

export async function getProfileUserIdById(supabase: SupabaseClient, profileId: string) {
  return supabase.from("profiles").select("user_id").eq("id", profileId).single();
}

export async function createProfile(supabase: SupabaseClient, userId: string, nickname: string) {
  return supabase.from("profiles").insert({ user_id: userId, nickname });
}
