"use client";

import type { GeneratedPlan } from "@/types/plan";

interface MealPrepGuideProps {
  plan: GeneratedPlan;
}

interface PrepStep {
  step?: number;
  instruction?: string;
}

export function MealPrepGuide({ plan }: MealPrepGuideProps) {
  const steps = (plan.meal_prep_guide ?? []) as PrepStep[];

  if (steps.length === 0) {
    return (
      <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
        <p className="text-text-dim text-sm">
          No meal prep guide in this plan. Your coach can regenerate to include
          Sunday prep instructions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
      <h3 className="font-heading font-bold text-lg mb-2">Sunday meal prep</h3>
      <p className="text-text-dim text-sm mb-6">
        Batch cook these items to prepare for the week ahead.
      </p>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 rounded-lg border border-[var(--green-08)]"
          >
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[var(--green-08)] text-green">
              {step.step ?? i + 1}
            </div>
            <p className="text-sm leading-relaxed flex-1">
              {step.instruction ?? ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
