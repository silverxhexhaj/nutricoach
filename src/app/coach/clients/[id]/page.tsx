import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { resolveClientDisplayNames } from "@/lib/client-name";
import { CoachClientProgress } from "./CoachClientProgress";
import { CoachFoodLog } from "./CoachFoodLog";
import { CoachExerciseLog } from "./CoachExerciseLog";
import { CoachSupplementLog } from "./CoachSupplementLog";
import { SupplementMatcher } from "./SupplementMatcher";
import { ExportPlanButton } from "./ExportPlanButton";
import { GeneratePlanButton } from "../../dashboard/GeneratePlanButton";
import { RemoveClientButton } from "./RemoveClientButton";

export default async function CoachClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/coach/dashboard");

  const { id: clientId } = await params;

  const { data: coach } = await supabase
    .from("coaches")
    .select("id, name, brand_name")
    .eq("user_id", user.id)
    .single();

  if (!coach) redirect("/coach/onboarding");

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, onboarding_complete, current_plan_id, user_id")
    .eq("id", clientId)
    .eq("coach_id", coach.id)
    .single();

  if (!client) notFound();

  const [resolved] = await resolveClientDisplayNames([client]);
  const displayName = resolved.name ?? "Unnamed client";

  const { data: profile } = await supabase
    .from("profiles")
    .select("goal, weight_kg, herbalife_products, other_supplements")
    .eq("user_id", client.user_id)
    .single();

  const [checkinsRes, planRes, programRes] = await Promise.all([
    supabase
      .from("checkins")
      .select("date, weight_kg, water_ml, calories, protein_g, workout_done, energy_level, notes")
      .eq("client_id", client.id)
      .order("date", { ascending: false })
      .limit(60),
    client.current_plan_id
      ? supabase
          .from("meal_plans")
          .select("plan_json")
          .eq("id", client.current_plan_id)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from("client_programs")
      .select("id, program_id, start_date, programs(name)")
      .eq("client_id", client.id)
      .eq("is_active", true)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const checkins = checkinsRes.data ?? [];
  const planJson = planRes.data?.plan_json;
  const programAssignment = programRes.data;
  const programData = programAssignment?.programs;
  const programName =
    programData && typeof programData === "object" && !Array.isArray(programData)
      ? (programData as { name?: string }).name
      : Array.isArray(programData) && programData[0]
        ? (programData[0] as { name?: string }).name
        : null;
  const assignedProgram =
    programAssignment?.start_date && programName
      ? { name: programName, startDate: programAssignment.start_date }
      : null;

  let programCompletion: {
    daysCompleted: number;
    totalDays: number;
    itemsCompleted: number;
    totalWorkoutMealItems: number;
  } | null = null;

  if (programAssignment?.id && programAssignment?.program_id) {
    const [dayCompletionsRes, itemCompletionsRes, programDaysWithItemsRes] =
      await Promise.all([
        supabase
          .from("program_day_completions")
          .select("id")
          .eq("client_program_id", programAssignment.id),
        supabase
          .from("program_item_completions")
          .select("id")
          .eq("client_program_id", programAssignment.id),
        supabase
          .from("program_days")
          .select("id, program_items(type)")
          .eq("program_id", programAssignment.program_id),
      ]);

    const totalDays = programDaysWithItemsRes.data?.length ?? 0;
    const daysCompleted = dayCompletionsRes.data?.length ?? 0;
    const itemsCompleted = itemCompletionsRes.data?.length ?? 0;
    const totalWorkoutMealItems =
      programDaysWithItemsRes.data?.flatMap((d) =>
        (d.program_items as { type: string }[] ?? []).filter(
          (i) => i.type === "workout" || i.type === "meal"
        )
      ).length ?? 0;

    programCompletion = {
      daysCompleted,
      totalDays,
      itemsCompleted,
      totalWorkoutMealItems,
    };
  }
  const calorieTarget =
    planJson?.calorie_target ?? planJson?.user_stats?.calorie_target ?? null;
  const proteinTarget =
    planJson?.protein_target ?? planJson?.user_stats?.protein_target_g ?? null;

  return (
    <div className="max-w-[900px] mx-auto py-12 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-2xl mb-1">
            {displayName}
          </h1>
          <p className="text-text-dim text-sm">
            {profile?.goal ? `Goal: ${profile.goal.replace(/_/g, " ")}` : "No goal set"}
            {profile?.weight_kg != null && ` · Current: ${profile.weight_kg} kg`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportPlanButton planId={client.current_plan_id} clientName={displayName} />
          <GeneratePlanButton
            clientId={client.id}
            clientName={displayName}
            onboardingComplete={client.onboarding_complete ?? false}
          />
          <RemoveClientButton
            clientId={client.id}
            clientName={displayName}
          />
        </div>
      </div>

      <div className="space-y-8">
        <SupplementMatcher
          clientId={client.id}
          initialHerbalife={profile?.herbalife_products ?? []}
          initialOther={profile?.other_supplements ?? []}
        />
        <CoachClientProgress
          checkins={checkins}
          calorieTarget={calorieTarget}
          proteinTarget={proteinTarget}
          assignedProgram={assignedProgram}
          programCompletion={programCompletion}
        />
        <CoachFoodLog
          clientId={client.id}
          calorieTarget={calorieTarget}
          proteinTarget={proteinTarget}
        />
        <CoachExerciseLog clientId={client.id} />
        <CoachSupplementLog clientId={client.id} />
      </div>
    </div>
  );
}
