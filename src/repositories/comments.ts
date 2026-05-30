import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCommentsByRecordId(supabase: SupabaseClient, recordId: string) {
  return supabase
    .from("record_comments")
    .select("*")
    .eq("record_id", recordId)
    .order("created_at", { ascending: true });
}

export async function createComment(adminSupabase: SupabaseClient, data: {
  record_id: string;
  author_name: string;
  content: string;
  image_url: string | null;
}) {
  return adminSupabase
    .from("record_comments")
    .insert(data)
    .select()
    .single();
}

export async function getCommentById(supabase: SupabaseClient, id: string) {
  return supabase
    .from("record_comments")
    .select("id, image_url")
    .eq("id", id)
    .single();
}

export async function deleteComment(supabase: SupabaseClient, id: string) {
  return supabase.from("record_comments").delete().eq("id", id);
}
