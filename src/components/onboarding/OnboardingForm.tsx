"use client";

import { useState, useCallback } from "react";
import { StepIndicator } from "./StepIndicator";
import { FormStep1 } from "./FormStep1";
import { FormStep2 } from "./FormStep2";
import { FormStep3 } from "./FormStep3";
import { PlanDisplay } from "@/components/plan/PlanDisplay";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { mapFormToPlanInput } from "@/lib/plan-mapping";
import type { GeneratedPlan } from "@/types/plan";

export interface OnboardingFormState {
  firstName: string;
  age: string;
  weight: string;
  height: string;
  sex: "male" | "female";
  fitnessGoal: string;
  trainingDays: string;
  activityLevel: string;
  dietaryRestrictions: string[];
  foodsToAvoid: string;
  supplementPreference: "standard" | "herbalife" | "mixed";
}

const INITIAL_STATE: OnboardingFormState = {
  firstName: "",
  age: "",
  weight: "",
  height: "",
  sex: "male",
  fitnessGoal: "Muscle Building",
  trainingDays: "3",
  activityLevel: "moderately active",
  dietaryRestrictions: ["none"],
  foodsToAvoid: "",
  supplementPreference: "standard",
};

const STREAM_STEPS = [
  "Calculating your TDEE & macro targets…",
  "Building 7-day personalised meal plan…",
  "Scheduling your supplement stack…",
  "Generating shopping list by category…",
  "Writing training-synced workout guide…",
];

const SUPPLEMENT_LABELS: Record<string, string> = {
  standard: "Standard supplements (whey, creatine, etc.)",
  herbalife: "Include Herbalife products",
  mixed: "Mix of both",
};

export function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState<OnboardingFormState>(INITIAL_STATE);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamLog, setStreamLog] = useState<string[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  const updateField = useCallback(
    (field: string, value: string | string[]) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const validateStep1 = useCallback(() => {
    const { weight, height, age } = formState;
    if (!weight?.trim() || !height?.trim() || !age?.trim()) {
      setStep1Error("Please fill in weight, height, and age to continue.");
      return false;
    }
    setStep1Error(null);
    return true;
  }, [formState]);

  const goToStep = useCallback(
    (targetStep: number) => {
      if (targetStep > 1 && !validateStep1()) {
        setStep(1);
        return;
      }
      setStep(targetStep);
    },
    [validateStep1]
  );

  const handleNext = useCallback(() => {
    if (step < 3) {
      goToStep(step + 1);
    }
  }, [step, goToStep]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
    }
  }, [step]);

  const handleGenerate = useCallback(async () => {
    setGenerateError(null);
    setIsGenerating(true);
    setStreamLog([`⏳ ${STREAM_STEPS[0]}`]);

    // Animate stream log while API runs
    const logInterval = setInterval(() => {
      setStreamLog((prev) => {
        const lastIdx = prev.findIndex((l) => l.startsWith("⏳"));
        if (lastIdx >= 0 && lastIdx < STREAM_STEPS.length - 1) {
          const done = `✅ ${STREAM_STEPS[lastIdx].replace("…", "")}`;
          const next = `⏳ ${STREAM_STEPS[lastIdx + 1]}`;
          return [...prev.filter((l) => !l.startsWith("⏳")), done, next];
        }
        return prev;
      });
    }, 2500);

    try {
      const input = mapFormToPlanInput(formState);
      const res = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          name: formState.firstName || "You",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Plan generation failed");

      setGeneratedPlan(data.plan);
      setValidationWarning(data.validationWarning ?? null);
      setStreamLog(STREAM_STEPS.map((s) => `✅ ${s.replace("…", "")}`));
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Plan generation failed");
    } finally {
      clearInterval(logInterval);
      setIsGenerating(false);
    }
  }, [formState]);

  const handleGenerateNew = useCallback(() => {
    setGeneratedPlan(null);
    setValidationWarning(null);
    setStep(1);
    setFormState(INITIAL_STATE);
    setStreamLog([]);
    setGenerateError(null);
    document.getElementById("build")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const summary = {
    name: formState.firstName || "You",
    goal: formState.fitnessGoal || "Not set",
    stats: `${formState.weight}kg · ${formState.height}cm · ${formState.age}y`,
    training: formState.trainingDays,
    diet:
      formState.dietaryRestrictions.length && formState.dietaryRestrictions[0] !== "none"
        ? formState.dietaryRestrictions.join(", ")
        : "none",
    supplements:
      SUPPLEMENT_LABELS[formState.supplementPreference]?.split("(")[0].trim() ||
      formState.supplementPreference,
  };

  return (
    <section
      id="build"
      className="py-20 px-6 bg-mid border-t border-[var(--green-08)]"
    >
      <div className="max-w-[1100px] mx-auto">
        <SectionLabel>AI Plan Generator</SectionLabel>
        <h2 className="font-heading font-extrabold text-3xl md:text-4xl tracking-tight leading-tight mb-4">
          Build your plan now.
        </h2>
        <p className="text-text-dim max-w-[460px] leading-relaxed mb-0">
          Answer a few quick questions and our AI creates your complete nutrition programme.
        </p>

        <div className="onboard-grid">
          <StepIndicator currentStep={step} onStepClick={goToStep} />

          <div className="form-preview">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            <FormStep1
              active={step === 1}
              values={{
                firstName: formState.firstName,
                age: formState.age,
                weight: formState.weight,
                height: formState.height,
                sex: formState.sex,
                fitnessGoal: formState.fitnessGoal,
              }}
              onChange={updateField}
              error={step1Error}
            />
            {step === 1 && (
              <div className="form-nav">
                <div />
                <button
                  type="button"
                  className="btn-form-next"
                  onClick={handleNext}
                >
                  Next: Lifestyle →
                </button>
              </div>
            )}

            <FormStep2
              active={step === 2}
              values={{
                trainingDays: formState.trainingDays,
                activityLevel: formState.activityLevel,
                dietaryRestrictions: formState.dietaryRestrictions,
                foodsToAvoid: formState.foodsToAvoid,
                supplementPreference: formState.supplementPreference,
              }}
              onChange={updateField}
            />
            {step === 2 && (
              <div className="form-nav">
                <button
                  type="button"
                  className="btn-form-prev"
                  onClick={handleBack}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="btn-form-next"
                  onClick={handleNext}
                >
                  Review & Generate →
                </button>
              </div>
            )}

            <FormStep3
              active={step === 3}
              summary={summary}
              isGenerating={isGenerating}
              streamLog={
                streamLog.length
                  ? streamLog
                  : isGenerating
                    ? ["⏳ " + STREAM_STEPS[0]]
                    : []
              }
              error={generateError}
              onGenerate={handleGenerate}
              onBack={handleBack}
            />
          </div>
        </div>
      </div>

      {generatedPlan && (
        <>
          {validationWarning && (
            <div className="max-w-[1100px] mx-auto px-6 -mt-4 mb-4">
              <div className="bg-[rgba(255,140,50,0.1)] border border-[rgba(255,140,50,0.3)] rounded-xl py-3 px-4 text-[#FF8A65] text-sm">
                {validationWarning}
              </div>
            </div>
          )}
          <PlanDisplay
            plan={generatedPlan}
            name={formState.firstName || "You"}
            goal={formState.fitnessGoal || "Plan"}
            onGenerateNew={handleGenerateNew}
          />
        </>
      )}
    </section>
  );
}
