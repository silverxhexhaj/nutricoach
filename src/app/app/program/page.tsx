import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Program, ProgramDay, ProgramItem, ClientProgramItemOverride } from "@/types/program";
import { WeekEditor } from "@/components/programs/WeekEditor";
import { mergeOverridesIntoDays } from "@/lib/programs/mergeOverrides";

export default async function ClientProgramPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/program");

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!client) redirect("/app");

  // Fetch active assignment (include id for completion tracking)
  const { data: assignment } = await supabase
    .from("client_programs")
    .select("id, program_id, start_date")
    .eq("client_id", client.id)
    .eq("is_active", true)
    .order("assigned_at", { ascending: false })
    .limit(1)
    .single();

  if (!assignment) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-6">
        <nav className="flex items-center gap-2 text-sm text-text-dim mb-8">
          <Link href="/app" className="hover:text-green transition-colors">
            My Plan
          </Link>
          <span>/</span>
          <span className="text-white">Program</span>
        </nav>
        <div className="bg-card border border-[var(--green-08)] rounded-xl p-12 text-center">
          <h2 className="font-heading font-bold text-xl mb-2">No program assigned yet</h2>
          <p className="text-text-dim text-sm">
            Your coach will assign a program when ready. Check back later or reach out to your coach.
          </p>
        </div>
      </div>
    );
  }

  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("id", assignment.program_id)
    .single();

  if (!program) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-6">
        <nav className="flex items-center gap-2 text-sm text-text-dim mb-8">
          <Link href="/app" className="hover:text-green transition-colors">
            My Plan
          </Link>
          <span>/</span>
          <span className="text-white">Program</span>
        </nav>
        <div className="bg-card border border-[var(--green-08)] rounded-xl p-12 text-center">
          <h2 className="font-heading font-bold text-xl mb-2">Program not found</h2>
          <p className="text-text-dim text-sm">
            The assigned program may have been removed. Please contact your coach.
          </p>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  const [daysRes, todayCheckinRes, dayCompletionsRes, itemCompletionsRes, overridesRes] =
    await Promise.all([
      supabase
        .from("program_days")
        .select("*, program_items(*)")
        .eq("program_id", assignment.program_id)
        .order("day_number", { ascending: true }),
      supabase
        .from("checkins")
        .select("weight_kg, water_ml, calories, protein_g, workout_done, energy_level, notes")
        .eq("client_id", client.id)
        .eq("date", today)
        .single(),
      supabase
        .from("program_day_completions")
        .select("program_day_id, completed_at")
        .eq("client_program_id", assignment.id),
      supabase
        .from("program_item_completions")
        .select("program_item_id, override_id, completed_at")
        .eq("client_program_id", assignment.id),
      supabase
        .from("client_program_item_overrides")
        .select("*")
        .eq("client_program_id", assignment.id),
    ]);

  const daysRaw = daysRes.data;
  const todayCheckin = todayCheckinRes.data;
  const overrides = (overridesRes.data ?? []) as ClientProgramItemOverride[];

  const dayCompletions: Record<string, string> = {};
  for (const row of dayCompletionsRes.data ?? []) {
    dayCompletions[row.program_day_id] = row.completed_at;
  }
  const itemCompletions: Record<string, string> = {};
  for (const row of itemCompletionsRes.data ?? []) {
    const key = row.program_item_id ?? row.override_id;
    if (key) itemCompletions[key] = row.completed_at;
  }
  const templateDays: ProgramDay[] = (daysRaw ?? []).map((day) => ({
    id: day.id,
    program_id: day.program_id,
    day_number: day.day_number,
    label: day.label,
    items: ((day.program_items ?? []) as ProgramItem[]).sort((a, b) => a.sort_order - b.sort_order),
  }));

  const days = overrides.length > 0
    ? mergeOverridesIntoDays(templateDays, overrides)
    : templateDays;

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <nav className="flex items-center gap-2 text-sm text-text-dim mb-8">
        <Link href="/app" className="hover:text-green transition-colors">
          My Plan
        </Link>
        <span>/</span>
        <span className="text-white truncate max-w-[200px]">{program.name}</span>
      </nav>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: program.color }}
          />
          <h1 className="font-heading font-extrabold text-2xl">{program.name}</h1>
        </div>
        {program.description && (
          <p className="text-text-dim text-sm max-w-xl">{program.description}</p>
        )}
      </div>

      <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
        <div className="mb-5">
          <h2 className="font-heading font-bold text-lg mb-1">Your Program</h2>
          <p className="text-text-dim text-sm">
            Programs are organized by days. Day 1 started when your coach assigned this program to you.
          </p>
        </div>
        <WeekEditor
          program={program as Program}
          days={days}
          readOnly
          startDate={assignment.start_date}
          clientProgramId={assignment.id}
          dayCompletions={dayCompletions}
          itemCompletions={itemCompletions}
        />
      </div>

      <div className="mt-10 p-4 rounded-xl border border-[var(--green-08)] bg-card">
        <h2 className="font-heading font-bold text-lg mb-1">Daily Check-in</h2>
        <p className="text-text-dim text-sm mb-4">
          Log weight, water, calories, protein, workout, and energy. Your coach sees your check-ins.
        </p>
        <Link
          href="/app/checkin"
          className="inline-flex items-center gap-2 text-green hover:underline font-medium"
        >
          {todayCheckin ? "View or edit today's check-in" : "Log today's check-in"}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
