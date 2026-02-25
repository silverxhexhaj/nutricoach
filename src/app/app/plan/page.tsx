import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { GeneratedPlan } from "@/types/plan";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import Link from "next/link";
import { PlanContent } from "./PlanContent";

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/plan");

  const params = await searchParams;
  const forceNew = params.new === "1";

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let activePlan: GeneratedPlan | null = null;
  let weekStartDate: string | null = null;

  if (client && !forceNew) {
    const { data: plan } = await supabase
      .from("meal_plans")
      .select("plan_json, week_start_date")
      .eq("client_id", client.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (plan) {
      activePlan = plan.plan_json as GeneratedPlan;
      weekStartDate = plan.week_start_date ?? null;
    }
  }

  if (!activePlan) {
    return (
      <div className="max-w-[1100px] mx-auto py-12 px-6">
        <div className="mb-6">
          <h1 className="font-heading font-extrabold text-2xl mb-2">My Plan</h1>
          <p className="text-text-dim text-sm">
            Complete a quick setup to generate your personalised nutrition plan.
          </p>
        </div>
        <OnboardingForm />
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto py-12 px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-extrabold text-2xl mb-1">My Plan</h1>
          <p className="text-text-dim text-sm">
            Your active nutrition plan and weekly structure.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/app/checkin" className="text-sm text-text-dim hover:text-green transition-colors">
            Go to check-in
          </Link>
        </div>
      </div>

      <PlanContent
        plan={activePlan}
        weekStartDate={weekStartDate}
        name={user.email?.split("@")[0] ?? "You"}
      />
    </div>
  );
}
