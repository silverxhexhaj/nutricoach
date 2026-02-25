/**
 * Optional Edamam macro validation.
 * When EDAMAM_APP_ID and EDAMAM_APP_KEY are set, validates plan macros.
 * Flags plans deviating >15% from target before saving.
 */

const EDAMAM_BASE = "https://api.edamam.com/api/nutrition-data";

export interface EdamamValidationResult {
  valid: boolean;
  deviationPercent: number;
  message?: string;
}

export async function validatePlanMacros(
  plan: {
    user_stats?: { calorie_target?: number; protein_target_g?: number };
    calorie_target?: number;
    protein_target?: number;
    weekly_plan?: Array<{
      meals?: Array<{
        name: string;
        kcal: number;
        protein_g: number;
        ingredients?: string[];
      }>;
    }>;
  },
  sampleSize = 3
): Promise<EdamamValidationResult | null> {
  const appId = process.env.EDAMAM_APP_ID;
  const appKey = process.env.EDAMAM_APP_KEY;
  if (!appId || !appKey) return null;

  const targetCal = plan.user_stats?.calorie_target ?? plan.calorie_target ?? 0;
  const targetProtein = plan.user_stats?.protein_target_g ?? plan.protein_target ?? 0;
  if (!targetCal || !targetProtein) return null;

  const weekly = plan.weekly_plan ?? [];
  const allMeals = weekly.flatMap((d) => d.meals ?? []).filter((m) => m.kcal > 0);
  const toSample = allMeals.slice(0, sampleSize);
  if (toSample.length === 0) return null;

  let totalCal = 0;
  let totalProtein = 0;

  for (const meal of toSample) {
    const ingr =
      meal.ingredients && meal.ingredients.length > 0
        ? meal.ingredients.slice(0, 3).join(", ")
        : `1 serving ${meal.name}`;
    const encoded = encodeURIComponent(ingr);
    const url = `${EDAMAM_BASE}?app_id=${appId}&app_key=${appKey}&ingr=${encoded}`;

    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = (await res.json()) as {
        calories?: number;
        totalNutrients?: { PROCNT?: { quantity?: number } };
      };
      totalCal += data.calories ?? meal.kcal;
      totalProtein += data.totalNutrients?.PROCNT?.quantity ?? meal.protein_g;
    } catch {
      totalCal += meal.kcal;
      totalProtein += meal.protein_g;
    }
  }

  const avgCal = totalCal / toSample.length;
  const avgProtein = totalProtein / toSample.length;
  const calDeviation = Math.abs(avgCal - targetCal) / targetCal;
  const proteinDeviation = Math.abs(avgProtein - targetProtein) / targetProtein;
  const maxDeviation = Math.max(calDeviation, proteinDeviation);

  if (maxDeviation > 0.15) {
    return {
      valid: false,
      deviationPercent: Math.round(maxDeviation * 100),
      message: `Plan macros deviate ~${Math.round(maxDeviation * 100)}% from target. Consider regenerating.`,
    };
  }

  return { valid: true, deviationPercent: Math.round(maxDeviation * 100) };
}
