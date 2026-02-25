import { NextRequest, NextResponse } from "next/server";
import type { FoodSearchResult } from "@/types/food";

const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

interface UsdaFoodItem {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  foodNutrients?: Array<{
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
}

interface UsdaSearchResponse {
  foods?: UsdaFoodItem[];
  totalHits?: number;
}

// USDA nutrient IDs for macros
const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
  fiber: 1079,
};

function getNutrient(food: UsdaFoodItem, nutrientId: number): number {
  const n = food.foodNutrients?.find((fn) => fn.nutrientId === nutrientId);
  return n?.value ?? 0;
}

function normalizeUsdaFood(food: UsdaFoodItem): FoodSearchResult {
  const servingSize = food.servingSize ?? 100;
  const servingUnit = food.servingSizeUnit ?? "g";

  // USDA reports nutrients per 100g. If serving size differs, scale values.
  const scale = servingSize / 100;

  return {
    fdcId: String(food.fdcId),
    name: food.description,
    brand: food.brandOwner ?? food.brandName,
    calories: Math.round(getNutrient(food, NUTRIENT_IDS.calories) * scale),
    protein_g: Math.round(getNutrient(food, NUTRIENT_IDS.protein) * scale * 10) / 10,
    carbs_g: Math.round(getNutrient(food, NUTRIENT_IDS.carbs) * scale * 10) / 10,
    fat_g: Math.round(getNutrient(food, NUTRIENT_IDS.fat) * scale * 10) / 10,
    fiber_g: Math.round(getNutrient(food, NUTRIENT_IDS.fiber) * scale * 10) / 10,
    servingSize,
    servingUnit,
    source: "usda",
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") ?? "15", 10), 25);

  if (!query || query.length < 2) {
    return NextResponse.json({ foods: [] });
  }

  const apiKey = process.env.USDA_API_KEY ?? "DEMO_KEY";

  const url = new URL(`${USDA_BASE}/foods/search`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("query", query);
  url.searchParams.set("pageSize", String(pageSize));
  // Prefer branded + SR Legacy for the most complete data
  url.searchParams.set("dataType", "Branded,SR Legacy,Foundation");

  try {
    const res = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Food database unavailable", foods: [] },
        { status: 502 }
      );
    }

    const data = (await res.json()) as UsdaSearchResponse;
    const foods: FoodSearchResult[] = (data.foods ?? []).map(normalizeUsdaFood);

    return NextResponse.json({ foods, totalHits: data.totalHits ?? foods.length });
  } catch {
    return NextResponse.json(
      { error: "Failed to search food database", foods: [] },
      { status: 500 }
    );
  }
}
