import { createClient } from "@/lib/supabase/server";

export type UserRole = "coach" | "client" | "individual" | null;

export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = await createClient();

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (coach) return "coach";

  const { data: client } = await supabase
    .from("clients")
    .select("coach_id")
    .eq("user_id", userId)
    .single();

  if (client) {
    return client.coach_id ? "client" : "individual";
  }

  return null;
}

export async function ensureClientRow(
  userId: string,
  coachId?: string,
  email?: string | null
) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existing) return existing.id;

  const nameFromEmail = email?.split("@")[0] ?? null;
  const { data: inserted, error } = await supabase
    .from("clients")
    .insert({
      user_id: userId,
      coach_id: coachId ?? null,
      name: nameFromEmail,
    })
    .select("id")
    .single();

  if (error) throw error;
  return inserted?.id;
}
