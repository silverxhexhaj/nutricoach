"use client";

import { useState } from "react";
import type { GeneratedPlan } from "@/types/plan";
import { MealPlanGrid } from "./MealPlanGrid";
import { WeeklyPlanCalendar } from "./WeeklyPlanCalendar";
import { SupplementSchedule } from "./SupplementSchedule";
import { ShoppingListGrid } from "./ShoppingListGrid";
import { WorkoutGrid } from "./WorkoutGrid";
import { MorningRitual } from "./MorningRitual";
import { MealPrepGuide } from "./MealPrepGuide";
import { ProductRecommendations } from "./ProductRecommendations";

interface PlanTabsProps {
  plan: GeneratedPlan;
  weekStartDate?: string | null;
}

const TABS = [
  { id: "morning", label: "Morning Routine" },
  { id: "meals", label: "Meal Plan" },
  { id: "week", label: "Week Calendar" },
  { id: "supplements", label: "Supplements" },
  { id: "shopping", label: "Shopping List" },
  { id: "mealprep", label: "Meal Prep" },
  { id: "workout", label: "Workout" },
  { id: "products", label: "Products" },
] as const;

export function PlanTabs({ plan, weekStartDate }: PlanTabsProps) {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("morning");

  return (
    <div>
      <div className="plan-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`plan-tab ${active === tab.id ? "active" : ""}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="animate-in fade-in duration-300">
        {active === "morning" && <MorningRitual plan={plan} />}
        {active === "meals" && <MealPlanGrid plan={plan} />}
        {active === "week" && (
          <WeeklyPlanCalendar plan={plan} weekStartDate={weekStartDate} />
        )}
        {active === "supplements" && <SupplementSchedule plan={plan} />}
        {active === "shopping" && <ShoppingListGrid plan={plan} />}
        {active === "mealprep" && <MealPrepGuide plan={plan} />}
        {active === "workout" && <WorkoutGrid plan={plan} />}
        {active === "products" && <ProductRecommendations plan={plan} />}
      </div>
    </div>
  );
}
