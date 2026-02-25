import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckInSection } from "@/components/checkin/CheckInSection";
import type { GeneratedPlan } from "@/types/plan";

export default async function CheckinPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/checkin");

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!client) redirect("/app");

  const today = new Date().toISOString().slice(0, 10);
  const [todayCheckinRes, planRes] = await Promise.all([
    supabase
      .from("checkins")
      .select("weight_kg, water_ml, calories, protein_g, workout_done, energy_level, notes")
      .eq("client_id", client.id)
      .eq("date", today)
      .single(),
    supabase
      .from("meal_plans")
      .select("plan_json")
      .eq("client_id", client.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const plan = (planRes.data?.plan_json as GeneratedPlan | undefined) ?? null;

  return (
    <div className="max-w-[1100px] mx-auto py-12 px-6">
      <h1 className="font-heading font-extrabold text-2xl mb-2">Daily Check-in</h1>
      <p className="text-text-dim text-sm mb-6">
        Log your daily metrics and keep your coach updated.
      </p>
      <CheckInSection
        todayCheckin={todayCheckinRes.data ?? null}
        calorieTarget={plan?.user_stats?.calorie_target ?? plan?.calorie_target ?? undefined}
        proteinTarget={plan?.user_stats?.protein_target_g ?? plan?.protein_target ?? undefined}
      />
    </div>
  );
}
