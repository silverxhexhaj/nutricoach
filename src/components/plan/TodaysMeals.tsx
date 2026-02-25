"use client";

import type { GeneratedPlan } from "@/types/plan";

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function getTodayDayName(): string {
  const d = new Date();
  return DAY_NAMES[(d.getDay() + 6) % 7];
}

interface TodaysMealsProps {
  plan: GeneratedPlan;
}

export function TodaysMeals({ plan }: TodaysMealsProps) {
  const weekly = plan.weekly_plan ?? [];
  const todayName = getTodayDayName();
  const todayPlan = weekly.find(
    (d) => d.day?.toLowerCase() === todayName.toLowerCase()
  );

  if (!todayPlan) return null;

  const isRest = todayPlan.type === "Rest" || todayPlan.is_training_day === false;
  const meals = todayPlan.meals ?? [];

  return (
    <div className="bg-card border border-[var(--green-08)] rounded-xl p-6 mb-8">
      <h3 className="font-heading font-bold text-lg mb-4">
        Today&apos;s Meals — {todayPlan.day}
      </h3>
      {isRest ? (
        <p className="text-text-dim text-sm leading-relaxed">
          Rest & recovery day. Focus on nutrition quality and hydration.
        </p>
      ) : meals.length === 0 ? (
        <p className="text-text-dim text-sm">No meals scheduled for today.</p>
      ) : (
        <div className="space-y-4">
          {meals.map((m, i) => (
            <div
              key={i}
              className="flex flex-col gap-1 pb-4 border-b border-[var(--green-08)] last:border-0 last:pb-0"
            >
              {m.type && (
                <span className="text-[0.62rem] text-text-dim uppercase tracking-wider font-semibold">
                  {m.type}
                </span>
              )}
              <span className="text-sm font-medium leading-snug">{m.name}</span>
              {(m.ingredients?.length ?? 0) > 0 && (
                <span className="text-xs text-text-dim">
                  {m.ingredients?.join(", ")}
                </span>
              )}
              {m.prep && (
                <span className="text-xs text-text-dim italic">{m.prep}</span>
              )}
              <span className="text-[0.68rem] text-green">
                {m.kcal} kcal · {m.protein_g}g protein
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
