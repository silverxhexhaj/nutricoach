import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ClientLibraryItem } from "@/types/program";
import { ClientLibraryList } from "./ClientLibraryList";

export default async function ClientLibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/library");

  const { data: client } = await supabase
    .from("clients")
    .select("id, coach_id")
    .eq("user_id", user.id)
    .single();

  if (!client) redirect("/app");

  const sharedQuery = supabase
    .from("library_items")
    .select("id, coach_id, is_platform, type, title, content, created_at, updated_at")
    .or(client.coach_id ? `is_platform.eq.true,coach_id.eq.${client.coach_id}` : "is_platform.eq.true")
    .order("updated_at", { ascending: false });

  const personalQuery = supabase
    .from("client_library_items")
    .select("id, type, title, content, created_at, updated_at")
    .eq("client_id", client.id)
    .order("updated_at", { ascending: false });

  const [{ data: sharedItems }, { data: personalItems }] = await Promise.all([sharedQuery, personalQuery]);

  const merged: ClientLibraryItem[] = [
    ...((personalItems ?? []).map((item) => ({
      id: item.id,
      coach_id: null,
      type: item.type,
      title: item.title,
      content: item.content as Record<string, unknown> | null,
      created_at: item.created_at,
      updated_at: item.updated_at,
      source: "personal" as const,
    })) as ClientLibraryItem[]),
    ...((sharedItems ?? []).map((item) => ({
      id: item.id,
      coach_id: item.coach_id,
      type: item.type,
      title: item.title,
      content: item.content as Record<string, unknown> | null,
      created_at: item.created_at,
      updated_at: item.updated_at,
      source: item.is_platform ? "platform" as const : "coach" as const,
    })) as ClientLibraryItem[]),
  ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <ClientLibraryList initialItems={merged} />
    </div>
  );
}
