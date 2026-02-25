import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { GeneratedPlan } from "@/types/plan";
import Link from "next/link";
import { TodaysMeals } from "@/components/plan/TodaysMeals";

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app");

  const params = await searchParams;
  const forceNew = params.new === "1";

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let activePlan: GeneratedPlan | null = null;
  let todayCheckin: {
    weight_kg: number | null;
    water_ml: number | null;
    calories: number | null;
    protein_g: number | null;
    workout_done: boolean | null;
    energy_level: number | null;
    notes: string | null;
  } | null = null;
  let streak = 0;

  if (client && !forceNew) {
    const [planRes, todayCheckinRes, checkinsRes] = await Promise.all([
      supabase
        .from("meal_plans")
        .select("plan_json")
        .eq("client_id", client.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("checkins")
        .select("weight_kg, water_ml, calories, protein_g, workout_done, energy_level, notes")
        .eq("client_id", client.id)
        .eq("date", new Date().toISOString().slice(0, 10))
        .single(),
      supabase
        .from("checkins")
        .select("date")
        .eq("client_id", client.id)
        .order("date", { ascending: false })
        .limit(30),
    ]);

    if (planRes.data) {
      activePlan = planRes.data.plan_json as GeneratedPlan;
    }
    if (todayCheckinRes.data) todayCheckin = todayCheckinRes.data;
    if (checkinsRes.data) {
      const dates = new Set(checkinsRes.data.map((row) => row.date));
      let expected = new Date().toISOString().slice(0, 10);
      while (dates.has(expected)) {
        streak += 1;
        const d = new Date(expected);
        d.setDate(d.getDate() - 1);
        expected = d.toISOString().slice(0, 10);
      }
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto py-12 px-6 space-y-8">
      <section>
        <h1 className="font-heading font-extrabold text-2xl mb-2">
          Welcome back, {user.email?.split("@")[0] ?? "there"}
        </h1>
        <p className="text-text-dim text-sm">
          Track today&apos;s progress and jump back into your nutrition flow.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card border border-[var(--green-08)] rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-text-dim">Plan status</p>
          <p className="font-heading font-bold text-xl mt-2">
            {activePlan ? "Active" : "Not generated"}
          </p>
          <Link href="/app/plan" className="text-sm text-green hover:underline mt-3 inline-block">
            {activePlan ? "Open plan" : "Create plan"} →
          </Link>
        </div>

        <div className="bg-card border border-[var(--green-08)] rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-text-dim">Today&apos;s check-in</p>
          <p className="font-heading font-bold text-xl mt-2">
            {todayCheckin ? "Completed" : "Pending"}
          </p>
          <Link
            href="/app/checkin"
            className="text-sm text-green hover:underline mt-3 inline-block"
          >
            {todayCheckin ? "View check-in" : "Log check-in"} →
          </Link>
        </div>

        <div className="bg-card border border-[var(--green-08)] rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-text-dim">Current streak</p>
          <p className="font-heading font-bold text-xl mt-2">
            {streak} {streak === 1 ? "day" : "days"}
          </p>
          <Link
            href="/app/progress"
            className="text-sm text-green hover:underline mt-3 inline-block"
          >
            See progress →
          </Link>
        </div>
      </section>

      {activePlan ? (
        <TodaysMeals plan={activePlan} />
      ) : (
        <section className="bg-card border border-[var(--green-08)] rounded-xl p-6">
          <h2 className="font-heading font-bold text-lg mb-2">Create your first plan</h2>
          <p className="text-text-dim text-sm mb-4">
            You don&apos;t have an active plan yet. Generate one from your profile in a couple of
            minutes.
          </p>
          <Link href="/app/plan" className="inline-flex items-center text-green hover:underline">
            Build my plan →
          </Link>
        </section>
      )}
    </div>
  );
}
