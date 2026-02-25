// PlanGenerationInput — PRD §7.1
export interface PlanGenerationInput {
  weight_kg: number;
  height_cm: number;
  age: number;
  goal: "build_muscle" | "lose_weight" | "maintain" | "recomposition";
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
  training_days: string[];
  training_type: string[];
  available_foods: string[];
  herbalife_products: string[];
  other_supplements: string[];
  dietary_restrictions: string[];
  meals_per_day: number;
  plan_duration_days: number;
}

// SupplementEntry — supports both PRD (training_day/rest_day) and HTML (morning/pre/post/evening)
export interface SupplementEntry {
  name: string;
  dose: string;
}

// GeneratedPlan — supports both PRD and HTML output structures
export interface GeneratedPlan {
  user_stats?: {
    name?: string;
    calorie_target?: number;
    protein_target_g?: number;
    carbs_target_g?: number;
    fat_target_g?: number;
    water_target_l?: number;
  };
  calorie_target?: number;
  protein_target?: number;
  water_target_ml?: number;
  morning_ritual?: Array<{ step: number; instruction: string; wait_minutes?: number }>;
  supplement_schedule:
    | { training_day: SupplementEntry[]; rest_day: SupplementEntry[] }
    | {
        morning?: SupplementEntry[];
        pre_workout?: SupplementEntry[];
        post_workout?: SupplementEntry[];
        evening?: SupplementEntry[];
      };
  weekly_plan: Array<{
    day: string;
    type?: string;
    is_training_day?: boolean;
    meals: Array<{
      type?: string;
      name: string;
      time?: string;
      ingredients?: string[];
      kcal: number;
      protein_g: number;
      prep?: string;
    }>;
  }>;
  shopping_list:
    | Array<{ category?: string; item?: string; name?: string }>
    | Record<string, string[]>;
  meal_prep_guide?: Array<{ step?: number; instruction?: string }>;
  exercise_guide?: unknown;
  workout_plan?: Array<{
    day: string;
    type: string;
    exercises: Array<{ name: string; sets: number; reps: string; notes?: string }>;
  }>;
  recommended_products?: unknown[];
}
