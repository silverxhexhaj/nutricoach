import { NextRequest, NextResponse } from "next/server";
import type { FoodSearchResult } from "@/types/food";

const OFF_BASE = "https://world.openfoodfacts.org/api/v2/product";

interface OFFNutriments {
  "energy-kcal_100g"?: number;
  "energy-kcal_serving"?: number;
  proteins_100g?: number;
  proteins_serving?: number;
  carbohydrates_100g?: number;
  carbohydrates_serving?: number;
  fat_100g?: number;
  fat_serving?: number;
  fiber_100g?: number;
  fiber_serving?: number;
}

interface OFFProduct {
  product_name?: string;
  brands?: string;
  serving_size?: string;
  serving_quantity?: number;
  nutriments?: OFFNutriments;
  code?: string;
}

interface OFFResponse {
  status: number;
  product?: OFFProduct;
}

function parseServingSize(raw?: string): { size: number; unit: string } {
  if (!raw) return { size: 100, unit: "g" };
  const match = raw.match(/^([\d.]+)\s*([a-zA-Z]+)/);
  if (match) {
    return { size: parseFloat(match[1]), unit: match[2].toLowerCase() };
  }
  return { size: 100, unit: "g" };
}

function normalizeOFFProduct(product: OFFProduct, barcode: string): FoodSearchResult {
  const n = product.nutriments ?? {};
  const servingQty = product.serving_quantity;
  const { size: servingSize, unit: servingUnit } = parseServingSize(product.serving_size);
  const effectiveServing = servingQty ?? servingSize;

  // Prefer per-serving values when available, otherwise use per-100g
  const calories = n["energy-kcal_serving"] ?? (n["energy-kcal_100g"] ?? 0) * effectiveServing / 100;
  const protein = n.proteins_serving ?? (n.proteins_100g ?? 0) * effectiveServing / 100;
  const carbs = n.carbohydrates_serving ?? (n.carbohydrates_100g ?? 0) * effectiveServing / 100;
  const fat = n.fat_serving ?? (n.fat_100g ?? 0) * effectiveServing / 100;
  const fiber = n.fiber_serving ?? (n.fiber_100g ?? 0) * effectiveServing / 100;

  return {
    fdcId: `off-${barcode}`,
    name: product.product_name ?? "Unknown Product",
    brand: product.brands,
    calories: Math.round(calories),
    protein_g: Math.round(protein * 10) / 10,
    carbs_g: Math.round(carbs * 10) / 10,
    fat_g: Math.round(fat * 10) / 10,
    fiber_g: Math.round(fiber * 10) / 10,
    servingSize: effectiveServing,
    servingUnit,
    source: "openfoodfacts",
    barcode,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim().replace(/\D/g, "");

  if (!code || code.length < 8) {
    return NextResponse.json(
      { error: "Invalid barcode — must be at least 8 digits" },
      { status: 400 }
    );
  }

  const url = `${OFF_BASE}/${code}.json?fields=product_name,brands,serving_size,serving_quantity,nutriments,code`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "NutriCoachAI/1.0 (https://nutricoach.ai)",
      },
      next: { revalidate: 86400 }, // cache for 24 hours — product data rarely changes
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Barcode lookup failed" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as OFFResponse;

    if (data.status !== 1 || !data.product) {
      return NextResponse.json(
        { error: "Product not found in barcode database" },
        { status: 404 }
      );
    }

    const food = normalizeOFFProduct(data.product, code);
    return NextResponse.json({ food });
  } catch {
    return NextResponse.json(
      { error: "Failed to look up barcode" },
      { status: 500 }
    );
  }
}
