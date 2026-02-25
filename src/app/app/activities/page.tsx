import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ActivitiesTimeline } from "./ActivitiesTimeline";
import type { GeneratedPlan } from "@/types/plan";
import type { SupplementLogEntry, ExerciseLogEntry } from "@/types/activity";

export default async function ActivitiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/activities");

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!client) redirect("/app");

  const today = new Date().toISOString().slice(0, 10);

  const [planRes, supplementLogsRes, exerciseLogsRes] = await Promise.all([
    supabase
      .from("meal_plans")
      .select("plan_json")
      .eq("client_id", client.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("supplement_logs")
      .select("*")
      .eq("client_id", client.id)
      .eq("date", today)
      .order("time_slot", { ascending: true }),
    supabase
      .from("exercise_logs")
      .select("*")
      .eq("client_id", client.id)
      .eq("date", today)
      .order("exercise_name", { ascending: true }),
  ]);

  const activePlan = planRes.data?.plan_json as GeneratedPlan | null;
  const supplementLogs = (supplementLogsRes.data ?? []) as SupplementLogEntry[];
  const exerciseLogs = (exerciseLogsRes.data ?? []) as ExerciseLogEntry[];

  return (
    <div className="max-w-[1100px] mx-auto py-12 px-6">
      <ActivitiesTimeline
        activePlan={activePlan}
        initialDate={today}
        initialSupplementLogs={supplementLogs}
        initialExerciseLogs={exerciseLogs}
      />
    </div>
  );
}
