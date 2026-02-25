"use client";

import type { GeneratedPlan } from "@/types/plan";

interface SupplementScheduleProps {
  plan: GeneratedPlan;
}

const SLOT_LABELS: Record<string, string> = {
  morning: "Morning",
  pre_workout: "Pre-Workout",
  post_workout: "Post-Workout",
  evening: "Evening",
  training_day: "Training Day",
  rest_day: "Rest Day",
};

export function SupplementSchedule({ plan }: SupplementScheduleProps) {
  const supps = plan.supplement_schedule ?? {};

  // Support both time-of-day (HTML) and training_day/rest_day (PRD) formats
  const isTimeOfDay = "morning" in supps || "pre_workout" in supps;
  const slots = isTimeOfDay
    ? [
        { key: "morning", items: (supps as Record<string, unknown[]>).morning ?? [] },
        { key: "pre_workout", items: (supps as Record<string, unknown[]>).pre_workout ?? [] },
        { key: "post_workout", items: (supps as Record<string, unknown[]>).post_workout ?? [] },
        { key: "evening", items: (supps as Record<string, unknown[]>).evening ?? [] },
      ]
    : [
        { key: "training_day", items: (supps as Record<string, unknown[]>).training_day ?? [] },
        { key: "rest_day", items: (supps as Record<string, unknown[]>).rest_day ?? [] },
      ];

  return (
    <div className="supp-schedule">
      {slots.map(
        (slot) =>
          Array.isArray(slot.items) &&
          slot.items.length > 0 && (
            <div key={slot.key} className="supp-block">
              <div className="font-heading font-bold text-green mb-3">
                {SLOT_LABELS[slot.key] ?? slot.key}
              </div>
              {slot.items.map((item: unknown, i: number) => {
                const entry = item as { name?: string; dose?: string };
                return (
                  <div key={i} className="supp-row">
                    <div className="w-[7px] h-[7px] rounded-full bg-green flex-shrink-0" />
                    <span className="text-sm font-medium">{entry.name ?? "—"}</span>
                    <span className="text-xs text-text-dim ml-auto">{entry.dose ?? ""}</span>
                  </div>
                );
              })}
            </div>
          )
      )}
    </div>
  );
}
