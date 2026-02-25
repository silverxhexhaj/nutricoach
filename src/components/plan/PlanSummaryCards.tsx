"use client";

import type { GeneratedPlan } from "@/types/plan";

interface PlanSummaryCardsProps {
  plan: GeneratedPlan;
}

export function PlanSummaryCards({ plan }: PlanSummaryCardsProps) {
  const stats = plan.user_stats ?? {};
  const calories = stats.calorie_target ?? plan.calorie_target ?? "—";
  const protein = stats.protein_target_g ?? plan.protein_target ?? "—";
  const carbs = stats.carbs_target_g ?? "—";
  const water =
    stats.water_target_l ?? (plan.water_target_ml ? `${plan.water_target_ml / 1000}L` : "—");

  return (
    <div className="plan-summary">
      <div className="plan-summary-card">
        <div className="val">{calories}</div>
        <div className="lbl">Daily Calories</div>
      </div>
      <div className="plan-summary-card">
        <div className="val">{typeof protein === "number" ? `${protein}g` : protein}</div>
        <div className="lbl">Protein</div>
      </div>
      <div className="plan-summary-card">
        <div className="val">{typeof carbs === "number" ? `${carbs}g` : carbs}</div>
        <div className="lbl">Carbs</div>
      </div>
      <div className="plan-summary-card">
        <div className="val">{water}</div>
        <div className="lbl">Water</div>
      </div>
    </div>
  );
}
