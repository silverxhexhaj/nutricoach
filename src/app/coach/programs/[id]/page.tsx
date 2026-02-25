import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import type {
  Program,
  ProgramDay,
  ProgramItem,
  ClientProgramItemOverride,
} from "@/types/program";
import { ProgramEditClient } from "./ProgramEditClient";

interface AssignedClient {
  assignmentId: string;
  clientId: string;
  name: string;
  startDate: string;
}

export interface AssignedClientData extends AssignedClient {
  overrides: ClientProgramItemOverride[];
  dayCompletions: Record<string, string>;
  itemCompletions: Record<string, string>;
}

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/coach/programs/${id}`);

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!coach) redirect("/coach/onboarding");

  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .eq("coach_id", coach.id)
    .single();

  if (!program) notFound();

  // Fetch days with their items
  const { data: daysRaw } = await supabase
    .from("program_days")
    .select("*, program_items(*)")
    .eq("program_id", id)
    .order("day_number", { ascending: true });

  const days: ProgramDay[] = (daysRaw ?? []).map((day) => ({
    id: day.id,
    program_id: day.program_id,
    day_number: day.day_number,
    label: day.label,
    items: ((day.program_items ?? []) as ProgramItem[]).sort((a, b) => a.sort_order - b.sort_order),
  }));

  // Fetch clients for assignment
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, user_id")
    .eq("coach_id", coach.id);

  const { data: activeAssignments } = await supabase
    .from("client_programs")
    .select("id, client_id, start_date")
    .eq("program_id", id)
    .eq("is_active", true)
    .order("assigned_at", { ascending: false });

  const clientNameById = new Map((clients ?? []).map((client) => [client.id, client.name ?? "Unnamed client"]));

  // For each assigned client, fetch overrides + completions
  const assignedClientsData: AssignedClientData[] = await Promise.all(
    (activeAssignments ?? []).map(async (assignment) => {
      const [overridesRes, dayCompRes, itemCompRes] = await Promise.all([
        supabase
          .from("client_program_item_overrides")
          .select("*")
          .eq("client_program_id", assignment.id),
        supabase
          .from("program_day_completions")
          .select("program_day_id, completed_at")
          .eq("client_program_id", assignment.id),
        supabase
          .from("program_item_completions")
          .select("program_item_id, override_id, completed_at")
          .eq("client_program_id", assignment.id),
      ]);

      const dayCompletions: Record<string, string> = {};
      for (const row of dayCompRes.data ?? []) {
        dayCompletions[row.program_day_id] = row.completed_at;
      }

      const itemCompletions: Record<string, string> = {};
      for (const row of itemCompRes.data ?? []) {
        const key = row.program_item_id ?? row.override_id;
        if (key) itemCompletions[key] = row.completed_at;
      }

      return {
        assignmentId: assignment.id,
        clientId: assignment.client_id,
        name: clientNameById.get(assignment.client_id) ?? "Unnamed client",
        startDate: assignment.start_date,
        overrides: (overridesRes.data ?? []) as ClientProgramItemOverride[],
        dayCompletions,
        itemCompletions,
      };
    })
  );

  return (
    <ProgramEditClient
      program={program as Program}
      days={days}
      clients={clients ?? []}
      assignedClients={assignedClientsData}
    />
  );
}
