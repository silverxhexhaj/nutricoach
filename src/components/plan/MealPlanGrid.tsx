"use client";

import { useState, useMemo } from "react";
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

interface MealPlanGridProps {
  plan: GeneratedPlan;
}

export function MealPlanGrid({ plan }: MealPlanGridProps) {
  const weekly = plan.weekly_plan ?? [];
  const todayName = getTodayDayName();
  const defaultDay = useMemo(() => {
    const found = weekly.find(
      (d) => d.day?.toLowerCase() === todayName.toLowerCase()
    );
    return found ? found.day : weekly[0]?.day ?? todayName;
  }, [weekly, todayName]);

  const [selectedDay, setSelectedDay] = useState<string>(defaultDay);

  const displayDays = weekly.filter((d) => d.day);
  const activeDay = weekly.find(
    (d) => d.day?.toLowerCase() === selectedDay.toLowerCase()
  ) ?? weekly[0];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {displayDays.map((day) => {
          const isSelected =
            day.day?.toLowerCase() === selectedDay.toLowerCase();
          const isToday = day.day?.toLowerCase() === todayName.toLowerCase();
          return (
            <button
              key={day.day}
              type="button"
              onClick={() => setSelectedDay(day.day)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-green text-dark"
                  : "bg-[var(--green-08)] text-text-dim hover:text-green hover:bg-[var(--green-08)]"
              }`}
            >
              {day.day}
              {isToday && " · Today"}
            </button>
          );
        })}
      </div>

      <div
        className={`week-grid ${activeDay && displayDays.length > 1 ? "single-day" : ""}`}
      >
        {(activeDay ? [activeDay] : weekly).map((day) => {
          const isRest = day.type === "Rest" || day.is_training_day === false;
          return (
            <div key={day.day} className="day-card">
              <div className="font-heading font-bold text-xs text-green uppercase mb-2">
                {day.day}
              </div>
              <div
                className={`text-xs font-semibold mb-2 ${
                  isRest ? "text-text-dim" : "text-green"
                }`}
              >
                {day.type ?? (isRest ? "Rest" : "Training")}
              </div>
              {isRest ? (
                <div className="text-text-dim text-sm leading-relaxed">
                  Rest & recovery. Focus on nutrition quality and hydration.
                </div>
              ) : (
                (day.meals ?? []).map((m, i) => (
                  <div key={i} className="meal-entry">
                    {m.type && (
                      <div className="text-[0.62rem] text-text-dim uppercase tracking-wider font-semibold">
                        {m.type}
                      </div>
                    )}
                    <div className="text-sm font-medium mt-0.5 leading-snug">
                      {m.name}
                    </div>
                    {(m.ingredients?.length ?? 0) > 0 && (
                      <div className="text-xs text-text-dim mt-1">
                        {m.ingredients?.join(", ")}
                      </div>
                    )}
                    {m.prep && (
                      <div className="text-xs text-text-dim mt-0.5 italic">
                        {m.prep}
                      </div>
                    )}
                    <div className="text-[0.68rem] text-green mt-0.5">
                      {m.kcal} kcal · {m.protein_g}g protein
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
