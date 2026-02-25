"use client";

import type { GeneratedPlan } from "@/types/plan";

interface WeeklyPlanCalendarProps {
  plan: GeneratedPlan;
  /** Optional week start date (YYYY-MM-DD) - we use the Monday of that week for display */
  weekStartDate?: string | null;
}

function getMondayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function WeeklyPlanCalendar({ plan, weekStartDate }: WeeklyPlanCalendarProps) {
  const weekly = plan.weekly_plan ?? [];
  const monday = weekStartDate ? getMondayOfWeek(weekStartDate) : null;

  const getDateForDayIndex = (index: number): string | null => {
    if (!monday) return null;
    const start = new Date(monday + "T12:00:00");
    const d = new Date(start);
    d.setDate(d.getDate() + index);
    return d.toISOString().slice(0, 10);
  };

  return (
    <div className="overflow-x-auto">
      <div className="week-grid min-w-[700px]">
        {weekly.map((day, index) => {
          const isRest = day.type === "Rest" || day.is_training_day === false;
          const dateStr = getDateForDayIndex(index);
          return (
            <div key={day.day} className="day-card">
              <div className="font-heading font-bold text-xs text-green uppercase mb-1">
                {day.day}
              </div>
              {dateStr && (
                <div className="text-[10px] text-text-dim mb-2">
                  {new Date(dateStr).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              )}
              <div
                className={`text-xs font-semibold mb-2 ${
                  isRest ? "text-text-dim" : "text-green"
                }`}
              >
                {day.type ?? (isRest ? "Rest" : "Training")}
              </div>
              {isRest ? (
                <div className="text-text-dim text-xs leading-relaxed">
                  Rest & recovery.
                </div>
              ) : (
                (day.meals ?? []).map((m, i) => (
                  <div key={i} className="meal-entry">
                    {m.type && (
                      <div className="text-[0.6rem] text-text-dim uppercase tracking-wider font-semibold">
                        {m.type}
                      </div>
                    )}
                    <div className="text-xs font-medium mt-0.5 leading-snug">
                      {m.name}
                    </div>
                    <div className="text-[0.65rem] text-green mt-0.5">
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
