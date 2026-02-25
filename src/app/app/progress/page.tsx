import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProgressDashboard } from "@/components/checkin/ProgressDashboard";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/progress");

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!client) redirect("/app");

  const { data: checkins } = await supabase
    .from("checkins")
    .select("date, weight_kg, water_ml, calories, protein_g, workout_done, energy_level")
    .eq("client_id", client.id)
    .order("date", { ascending: false })
    .limit(60);

  const rows = checkins ?? [];

  return (
    <div className="max-w-[1100px] mx-auto py-12 px-6">
      <h1 className="font-heading font-extrabold text-2xl mb-2">Progress</h1>
      <p className="text-text-dim text-sm mb-6">
        Review consistency, trends, and recent check-in history.
      </p>

      <ProgressDashboard checkins={rows} />

      <section className="bg-card border border-[var(--green-08)] rounded-xl p-6">
        <h2 className="font-heading font-bold text-lg mb-4">Recent check-ins</h2>
        {rows.length === 0 ? (
          <p className="text-text-dim text-sm">No check-ins yet.</p>
        ) : (
          <div className="space-y-3">
            {rows.slice(0, 12).map((row) => (
              <div
                key={row.date}
                className="flex flex-wrap items-center justify-between gap-3 text-sm border-b border-[var(--green-08)] pb-3 last:border-b-0 last:pb-0"
              >
                <span className="font-medium">{new Date(row.date).toLocaleDateString("en-GB")}</span>
                <span className="text-text-dim">
                  {row.weight_kg ?? "-"} kg · {row.calories ?? "-"} kcal · {row.protein_g ?? "-"} g protein
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
