"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateClientProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const weight = formData.get("weight_kg") as string;
  const height = formData.get("height_cm") as string;
  const age = formData.get("age") as string;
  const goal = (formData.get("goal") as string) || null;
  const activityLevel = (formData.get("activity_level") as string) || null;
  const trainingDays = formData.get("training_days") as string;
  const dietaryRestrictionsRaw = formData.get("dietary_restrictions") as string;
  const availableFoods = (formData.get("available_foods") as string)?.trim() || null;
  const supplements = (formData.get("supplements") as string) || "standard";

  const dietaryRestrictions = dietaryRestrictionsRaw
    ? dietaryRestrictionsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : ["none"];

  const weightKg = weight ? parseFloat(weight) : null;
  const heightCm = height ? parseFloat(height) : null;
  const ageInt = age ? parseInt(age, 10) : null;
  const trainingDaysInt = trainingDays ? parseInt(trainingDays, 10) : null;

  const { error } = await supabase
    .from("profiles")
    .update({
      weight_kg: weightKg,
      height_cm: heightCm,
      age: ageInt,
      goal,
      activity_level: activityLevel,
      training_days: trainingDaysInt,
      dietary_restrictions: dietaryRestrictions,
      available_foods: availableFoods,
      supplements,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/app/profile");
  revalidatePath("/app");
  return { success: true };
}
