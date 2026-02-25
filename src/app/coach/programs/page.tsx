import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Program } from "@/types/program";
import { ProgramsList } from "./ProgramsList";

export default async function CoachProgramsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/coach/programs");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!coach) redirect("/coach/onboarding");

  const { data: programs } = await supabase
    .from("programs")
    .select("*")
    .eq("coach_id", coach.id)
    .order("created_at", { ascending: false });

  const programIds = (programs ?? []).map((program) => program.id);
  let assignmentCounts: Record<string, number> = {};

  if (programIds.length > 0) {
    const { data: activeAssignments } = await supabase
      .from("client_programs")
      .select("program_id")
      .in("program_id", programIds)
      .eq("is_active", true);

    assignmentCounts = (activeAssignments ?? []).reduce<Record<string, number>>((acc, row) => {
      acc[row.program_id] = (acc[row.program_id] ?? 0) + 1;
      return acc;
    }, {});
  }

  return (
    <div className="max-w-[960px] mx-auto py-12 px-6">
      <ProgramsList
        initialPrograms={(programs as Program[]) ?? []}
        initialAssignmentCounts={assignmentCounts}
      />
    </div>
  );
}
