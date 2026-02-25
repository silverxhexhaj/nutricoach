"use client";

import type { GeneratedPlan } from "@/types/plan";

interface WorkoutGridProps {
  plan: GeneratedPlan;
}

export function WorkoutGrid({ plan }: WorkoutGridProps) {
  const wo = plan.workout_plan ?? [];

  if (!wo.length) {
    return (
      <div className="text-text-dim">
        Workout plan synced to your training days and meal timing.
      </div>
    );
  }

  return (
    <div className="workout-grid">
      {wo.map((w, i) => {
        const exercises = (w as { exercises?: Array<{ name: string; sets: number; reps: string }> }).exercises ?? [];
        if (!exercises.length) return null;
        return (
          <div key={i} className="workout-day-card">
            <div className="font-heading font-bold text-base mb-1">{w.day}</div>
            <div className="text-xs text-green font-semibold uppercase tracking-wider mb-3">
              {w.type}
            </div>
            {exercises.map((ex, j) => (
              <div key={j} className="exercise-row">
                <span>{ex.name}</span>
                <span className="text-text-dim text-sm">
                  {ex.sets} × {ex.reps}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
