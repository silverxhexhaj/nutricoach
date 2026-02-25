import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { resolveClientDisplayNames } from "@/lib/client-name";
import { OverviewStats } from "./OverviewStats";
import { RecentCheckins } from "./RecentCheckins";
import { ActivePlansSection } from "./ActivePlansSection";

export default async function CoachDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/coach/dashboard");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id, name, brand_name, logo_url")
    .eq("user_id", user.id)
    .single();

  if (!coach) redirect("/coach/onboarding");

  const { data: clientsRaw } = await supabase
    .from("clients")
    .select("id, name, onboarding_complete, current_plan_id, user_id")
    .eq("coach_id", coach.id);

  // Resolve display names: use clients.name, or fall back to user email for null names
  const clients = await resolveClientDisplayNames(clientsRaw ?? []);

  const clientIds = clients?.map((c) => c.id) ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const [todayCheckinsRes, recentCheckinsRes] = await Promise.all([
    clientIds.length > 0
      ? supabase
          .from("checkins")
          .select("client_id")
          .in("client_id", clientIds)
          .eq("date", today)
      : Promise.resolve({ data: [] }),
    clientIds.length > 0
      ? supabase
          .from("checkins")
          .select("client_id, date, weight_kg, calories, protein_g, water_ml, workout_done, energy_level, notes")
          .in("client_id", clientIds)
          .order("date", { ascending: false })
          .limit(15)
      : Promise.resolve({ data: [] }),
  ]);

  const todayCheckinClientIds = new Set(
    (todayCheckinsRes.data ?? []).map((c) => c.client_id)
  );

  const clientNameMap = new Map(
    (clients ?? []).map((c) => [c.id, c.name ?? "Unnamed client"])
  );
  const recentCheckins = (recentCheckinsRes.data ?? []).map((c) => ({
    clientId: c.client_id,
    clientName: clientNameMap.get(c.client_id) ?? "Unnamed client",
    date: c.date,
    weightKg: c.weight_kg,
    calories: c.calories,
    proteinG: c.protein_g,
    waterMl: c.water_ml,
    workoutDone: c.workout_done,
    energyLevel: c.energy_level,
    notes: c.notes,
  }));

  const activePlansCount = (clients ?? []).filter(
    (c) => c.current_plan_id
  ).length;

  return (
    <div className="max-w-[900px] mx-auto py-12 px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-extrabold text-2xl mb-2">
            {coach.brand_name || coach.name || "Coach"} Dashboard
          </h1>
          <p className="text-text-dim">
            Overview of your coaching activity.
          </p>
        </div>
        <Link
          href="/coach/calendar"
          className="text-sm text-text-dim hover:text-green transition-colors"
        >
          Check-in calendar →
        </Link>
      </div>

      <OverviewStats
        totalClients={clients?.length ?? 0}
        checkinsToday={todayCheckinClientIds.size}
        activePlans={activePlansCount}
      />

      <section className="mb-12">
        <h2 className="font-heading font-bold text-lg mb-4">
          Recent check-ins
        </h2>
        <RecentCheckins checkins={recentCheckins} />
        <Link
          href="/coach/calendar"
          className="text-sm text-green hover:underline mt-2 inline-block"
        >
          View full calendar →
        </Link>
      </section>

      <section className="mb-12">
        <h2 className="font-heading font-bold text-lg mb-4">
          Active plans
        </h2>
        <ActivePlansSection clients={clients ?? []} />
      </section>

    </div>
  );
}
