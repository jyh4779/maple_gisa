import type { SupabaseClient } from "@supabase/supabase-js";

export async function getServiceRecordsByCharacterId(supabase: SupabaseClient, characterId: string) {
  return supabase
    .from("service_records")
    .select("*")
    .eq("character_id", characterId)
    .order("service_date", { ascending: false });
}

export async function getServiceRecordById(supabase: SupabaseClient, id: string) {
  return supabase
    .from("service_records")
    .select("id, image_urls, character_id")
    .eq("id", id)
    .single();
}

export async function createServiceRecord(supabase: SupabaseClient, data: {
  character_id: string;
  title: string;
  description: string | null;
  client_nickname: string | null;
  price: number;
  service_date: string;
  exp_gained: number | null;
  hunt_duration_minutes: number | null;
  hunting_ground: string | null;
  image_urls: string[];
}) {
  return supabase.from("service_records").insert(data);
}

export async function updateServiceRecord(adminSupabase: SupabaseClient, id: string, data: {
  title: string;
  description: string | null;
  client_nickname: string | null;
  price: number;
  service_date: string;
  exp_gained: number | null;
  hunt_duration_minutes: number | null;
  hunting_ground: string | null;
  image_urls: string[];
}) {
  return adminSupabase
    .from("service_records")
    .update(data)
    .eq("id", id)
    .select();
}

export async function deleteServiceRecord(supabase: SupabaseClient, id: string) {
  return supabase.from("service_records").delete().eq("id", id);
}
