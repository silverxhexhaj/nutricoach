import type { PlanGenerationInput } from "@/types/plan";
import type { OnboardingFormState } from "@/components/onboarding/OnboardingForm";

// Profile row from Supabase (for coach-generate flow)
export interface ProfileRow {
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  goal: string | null;
  activity_level: string | null;
  training_days: number | null;
  dietary_restrictions: string[] | null;
  available_foods: string | null;
  supplements: string | null;
  herbalife_products: string[] | null;
  other_supplements: string[] | null;
}

const GOAL_MAP: Record<string, PlanGenerationInput["goal"]> = {
  "Muscle Building": "build_muscle",
  "Fat Loss": "lose_weight",
  Maintenance: "maintain",
  Endurance: "recomposition",
};

const ACTIVITY_MAP: Record<string, PlanGenerationInput["activity_level"]> = {
  sedentary: "sedentary",
  "lightly active": "light",
  "moderately active": "moderate",
  "very active": "active",
};

const ACTIVITY_REVERSE: Record<PlanGenerationInput["activity_level"], string> = {
  sedentary: "sedentary",
  light: "lightly active",
  moderate: "moderately active",
  active: "very active",
  very_active: "very active",
};

const GOAL_REVERSE: Record<PlanGenerationInput["goal"], string> = {
  build_muscle: "Muscle Building",
  lose_weight: "Fat Loss",
  maintain: "Maintenance",
  recomposition: "Endurance",
};

// Map training days count to day names (e.g. 3 -> Mon, Wed, Fri)
const TRAINING_DAY_PRESETS: Record<string, string[]> = {
  "2": ["monday", "thursday"],
  "3": ["monday", "wednesday", "friday"],
  "4": ["monday", "tuesday", "thursday", "friday"],
  "5": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "6": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
};

const DEFAULT_AVAILABLE_FOODS = [
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
];

export function mapFormToPlanInput(
  form: OnboardingFormState
): PlanGenerationInput {
  const foodsToAvoid = form.foodsToAvoid
    ? form.foodsToAvoid.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    : [];
  const available_foods = DEFAULT_AVAILABLE_FOODS.filter(
    (f) => !foodsToAvoid.some((a) => f.includes(a) || a.includes(f))
  );

  const dietaryRestrictions =
    form.dietaryRestrictions?.filter((d) => d !== "none") ?? [];
  if (dietaryRestrictions.length === 0) {
    dietaryRestrictions.push("none");
  }

  const { herbalife_products, other_supplements } =
    form.supplementPreference === "herbalife"
      ? {
          herbalife_products: ["Formula 1", "Herbal Aloe", "Herbalife24"],
          other_supplements: [] as string[],
        }
      : form.supplementPreference === "mixed"
        ? {
            herbalife_products: ["Formula 1"],
            other_supplements: ["whey protein", "creatine monohydrate"],
          }
        : {
            herbalife_products: [] as string[],
            other_supplements: ["whey protein", "creatine monohydrate", "omega-3", "multivitamin"],
          };

  return {
    weight_kg: parseFloat(form.weight) || 70,
    height_cm: parseFloat(form.height) || 175,
    age: parseInt(form.age, 10) || 30,
    goal: GOAL_MAP[form.fitnessGoal] ?? "build_muscle",
    activity_level: ACTIVITY_MAP[form.activityLevel] ?? "moderate",
    training_days: TRAINING_DAY_PRESETS[form.trainingDays] ?? ["monday", "wednesday", "friday"],
    training_type: ["push-ups", "kettlebells"],
    available_foods,
    herbalife_products,
    other_supplements,
    dietary_restrictions: dietaryRestrictions,
    meals_per_day: 5,
    plan_duration_days: 7,
  };
}

/** Map profile row to PlanGenerationInput for coach-generate flow */
export function profileToPlanInput(profile: ProfileRow): PlanGenerationInput | null {
  const weight = profile.weight_kg ?? 70;
  const height = profile.height_cm ?? 175;
  const age = profile.age ?? 30;
  if (!weight || !height || !age) return null;

  const goalStr = profile.goal ?? "Muscle Building";
  const goal = GOAL_MAP[goalStr] ?? "build_muscle";
  const activityStr = profile.activity_level ?? "moderately active";
  const activity_level = ACTIVITY_MAP[activityStr] ?? "moderate";
  const trainingDaysCount = profile.training_days ?? 3;
  const training_days =
    TRAINING_DAY_PRESETS[String(trainingDaysCount)] ?? ["monday", "wednesday", "friday"];

  const dietaryRestrictions = profile.dietary_restrictions?.filter((d) => d !== "none") ?? [];
  if (dietaryRestrictions.length === 0) dietaryRestrictions.push("none");

  const available_foods = profile.available_foods
    ? profile.available_foods.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    : DEFAULT_AVAILABLE_FOODS;

  // Use coach-assigned products if set, otherwise derive from supplements preference
  const coachHerbalife = profile.herbalife_products?.filter(Boolean) ?? [];
  const coachOther = profile.other_supplements?.filter(Boolean) ?? [];
  const hasCoachProducts = coachHerbalife.length > 0 || coachOther.length > 0;

  const supp = (profile.supplements ?? "standard").toLowerCase();
  const defaultProducts =
    supp === "herbalife"
      ? {
          herbalife_products: ["Formula 1", "Herbal Aloe", "Herbalife24"],
          other_supplements: [] as string[],
        }
      : supp === "mixed"
        ? {
            herbalife_products: ["Formula 1"],
            other_supplements: ["whey protein", "creatine monohydrate"],
          }
        : {
            herbalife_products: [] as string[],
            other_supplements: ["whey protein", "creatine monohydrate", "omega-3", "multivitamin"],
          };

  const herbalife_products = hasCoachProducts ? coachHerbalife : defaultProducts.herbalife_products;
  const other_supplements = hasCoachProducts ? coachOther : defaultProducts.other_supplements;

  return {
    weight_kg: Number(weight),
    height_cm: Number(height),
    age: Number(age),
    goal,
    activity_level,
    training_days,
    training_type: ["push-ups", "kettlebells"],
    available_foods,
    herbalife_products,
    other_supplements,
    dietary_restrictions: dietaryRestrictions,
    meals_per_day: 5,
    plan_duration_days: 7,
  };
}

/** Map PlanGenerationInput to profile update payload (for saving after onboarding) */
export function mapPlanInputToProfile(input: PlanGenerationInput): {
  weight_kg: number;
  height_cm: number;
  age: number;
  goal: string;
  activity_level: string;
  training_days: number;
  dietary_restrictions: string[];
  available_foods: string;
  supplements: string;
} {
  const supp =
    input.herbalife_products.length > 0 && input.other_supplements.length > 0
      ? "mixed"
      : input.herbalife_products.length > 0
        ? "herbalife"
        : "standard";
  return {
    weight_kg: input.weight_kg,
    height_cm: input.height_cm,
    age: input.age,
    goal: GOAL_REVERSE[input.goal] ?? "Muscle Building",
    activity_level: ACTIVITY_REVERSE[input.activity_level] ?? "moderately active",
    training_days: input.training_days.length,
    dietary_restrictions: input.dietary_restrictions,
    available_foods: input.available_foods.join(", "),
    supplements: supp,
  };
}
