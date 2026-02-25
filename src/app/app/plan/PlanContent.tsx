"use client";

import { useRouter } from "next/navigation";
import { TodaysMeals } from "@/components/plan/TodaysMeals";
import { PlanDisplay } from "@/components/plan/PlanDisplay";
import type { GeneratedPlan } from "@/types/plan";

interface PlanContentProps {
  plan: GeneratedPlan;
  weekStartDate: string | null;
  name: string;
}

export function PlanContent({ plan, weekStartDate, name }: PlanContentProps) {
  const router = useRouter();

  return (
    <>
      <TodaysMeals plan={plan} />
      <PlanDisplay
        plan={plan}
        weekStartDate={weekStartDate}
        name={name}
        goal="Plan"
        onGenerateNew={() => router.push("/app/plan?new=1")}
      />
    </>
  );
}
