import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { LibraryItem } from "@/types/program";
import { LibraryList } from "./LibraryList";

export default async function CoachLibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/coach/library");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!coach) redirect("/coach/onboarding");

  const { data: items } = await supabase
    .from("library_items")
    .select("*")
    .eq("coach_id", coach.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="max-w-[960px] mx-auto py-12 px-6">
      <LibraryList initialItems={(items as LibraryItem[]) ?? []} />
    </div>
  );
}
