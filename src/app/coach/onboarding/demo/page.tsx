"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlanDisplay } from "@/components/plan/PlanDisplay";
import type { GeneratedPlan, PlanGenerationInput } from "@/types/plan";

const DEMO_PLAN_INPUT: PlanGenerationInput = {
  weight_kg: 75,
  height_cm: 178,
  age: 32,
  goal: "build_muscle",
  activity_level: "moderate",
  training_days: ["monday", "wednesday", "friday"],
  training_type: ["strength training"],
  available_foods: [
    "chicken breast",
    "eggs",
    "oats",
    "rice",
    "broccoli",
    "spinach",
    "banana",
    "greek yogurt",
    "almonds",
    "sweet potato",
    "salmon",
    "quinoa",
  ],
  herbalife_products: [],
  other_supplements: ["whey protein", "creatine monohydrate", "omega-3", "multivitamin"],
  dietary_restrictions: ["none"],
  meals_per_day: 5,
  plan_duration_days: 7,
};

export default function CoachOnboardingDemoPage() {
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGenerateSample() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: DEMO_PLAN_INPUT,
          name: "Sample Client",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate plan");
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Plan generation failed");
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    router.push("/coach/dashboard");
    router.refresh();
  }

  if (plan) {
    return (
      <div className="min-h-screen bg-dark">
        <div className="max-w-[900px] mx-auto py-8 px-6">
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/coach/dashboard"
              className="text-sm text-green hover:underline"
            >
              Go to dashboard
            </Link>
          </div>
          <PlanDisplay
            plan={plan}
            weekStartDate={null}
            name="Sample Client"
            goal="Muscle Building"
            onGenerateNew={handleGenerateSample}
          />
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/coach/dashboard"
              className="btn-form-next py-3 px-8 text-center no-underline"
            >
              Go to dashboard
            </Link>
            <button
              onClick={() => {
                setPlan(null);
                setError(null);
              }}
              className="text-sm text-text-dim hover:text-green transition-colors"
            >
              Back to demo options
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-6">
      <a
        href="/"
        className="font-heading font-extrabold text-xl text-green mb-8"
      >
        NutriCoach <span className="text-text">AI</span>
      </a>
      <div className="w-full max-w-[420px]">
        <h1 className="font-heading font-extrabold text-2xl mb-2">
          See what your clients will get
        </h1>
        <p className="text-text-dim text-sm mb-8">
          Generate a sample plan to preview the full output — meals, supplements,
          shopping list, and workout guide. This is optional; you can skip and
          add clients first.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGenerateSample}
            disabled={loading}
            className="btn-form-next w-full py-3"
          >
            {loading ? "Generating sample plan…" : "Generate sample plan"}
          </button>
          <button
            onClick={handleSkip}
            disabled={loading}
            className="w-full py-3 text-text-dim hover:text-green transition-colors text-sm font-medium"
          >
            Skip — I&apos;ll add clients first
          </button>
        </div>
        {error && (
          <div className="error-box mt-4">{error}</div>
        )}
      </div>
    </div>
  );
}
