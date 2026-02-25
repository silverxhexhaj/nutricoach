"use client";

import { useState, useEffect } from "react";
import type { GeneratedPlan } from "@/types/plan";

interface MorningRitualProps {
  plan: GeneratedPlan;
}

interface RitualStep {
  step: number;
  instruction: string;
  wait_minutes?: number;
}

export function MorningRitual({ plan }: MorningRitualProps) {
  const steps = (plan.morning_ritual ?? []) as RitualStep[];
  const [activeStep, setActiveStep] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setInterval(() => {
      setCountdown((c) => (c != null && c > 0 ? c - 1 : null));
    }, 1000);
    return () => clearInterval(t);
  }, [countdown]);

  if (steps.length === 0) {
    return (
      <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
        <p className="text-text-dim text-sm">
          No morning routine in this plan. Your coach can add one when generating a
          new plan.
        </p>
      </div>
    );
  }

  const currentStep = steps[activeStep];
  const isLastStep = activeStep === steps.length - 1;

  const handleStartTimer = (minutes: number) => {
    setCountdown(minutes * 60);
  };

  const handleNext = () => {
    if (isLastStep) return;
    setCountdown(null);
    setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setCountdown(null);
    setActiveStep((s) => Math.max(s - 1, 0));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
      <h3 className="font-heading font-bold text-lg mb-2">Your morning ritual</h3>
      <p className="text-text-dim text-sm mb-6">
        Follow these steps every day to start your routine.
      </p>

      <div className="space-y-6">
        {steps.map((step, i) => (
          <div
            key={step.step}
            className={`flex gap-4 p-4 rounded-lg border ${
              i === activeStep
                ? "border-green bg-[var(--green-08)]"
                : "border-[var(--green-08)] opacity-70"
            }`}
          >
            <div
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i === activeStep ? "bg-green text-dark" : "bg-[var(--green-08)] text-text-dim"
              }`}
            >
              {step.step}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-relaxed">
                {step.instruction}
              </p>
              {i === activeStep && step.wait_minutes != null && step.wait_minutes > 0 && (
                <div className="mt-3">
                  {countdown !== null ? (
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg font-bold text-green">
                        {formatTime(countdown)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCountdown(null)}
                        className="text-xs text-text-dim hover:text-green transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartTimer(step.wait_minutes!)}
                      className="text-sm text-green hover:underline"
                    >
                      Start {step.wait_minutes}-minute timer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8 pt-4 border-t border-[var(--green-08)]">
        <button
          type="button"
          onClick={handlePrev}
          disabled={activeStep === 0}
          className="text-sm text-text-dim hover:text-green disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isLastStep}
          className="text-sm text-green hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLastStep ? "Done" : "Next"}
        </button>
      </div>
    </div>
  );
}
