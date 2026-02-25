export type FoodSource = "usda" | "openfoodfacts" | "manual";

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack" | "supplement";

export const MEAL_SLOTS: MealSlot[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "supplement",
];

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
  supplement: "Supplement",
};

export interface FoodSearchResult {
  fdcId: string;
  name: string;
  brand?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  servingSize: number;
  servingUnit: string;
  source: FoodSource;
  barcode?: string;
}

export interface FoodLogEntry {
  id: string;
  client_id: string;
  checkin_date: string;
  meal_slot: MealSlot;
  food_name: string;
  brand?: string | null;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number | null;
  source: FoodSource | null;
  source_id?: string | null;
  barcode?: string | null;
  created_at: string;
}

export interface DailyFoodSummary {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  entries_by_meal: Partial<Record<MealSlot, FoodLogEntry[]>>;
}

export interface AddFoodLogPayload {
  checkin_date: string;
  meal_slot: MealSlot;
  food_name: string;
  brand?: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  source: FoodSource;
  source_id?: string;
  barcode?: string;
}
