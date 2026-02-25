import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { validatePlanMacros } from "@/lib/edamam";
import { profileToPlanInput, mapPlanInputToProfile } from "@/lib/plan-mapping";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-response";
import type { PlanGenerationInput, GeneratedPlan } from "@/types/plan";

const GeneratedPlanSchema = z.object({
  user_stats: z.record(z.string(), z.unknown()).optional(),
  calorie_target: z.number().optional(),
  protein_target: z.number().optional(),
  water_target_ml: z.number().optional(),
  supplement_schedule: z.record(z.string(), z.unknown()),
  weekly_plan: z.array(
    z.object({
      day: z.string(),
      type: z.string().optional(),
      is_training_day: z.boolean().optional(),
      meals: z.array(
        z.object({
          name: z.string(),
          kcal: z.number(),
          protein_g: z.number(),
          type: z.string().optional(),
          time: z.string().optional(),
          ingredients: z.array(z.string()).optional(),
          prep: z.string().optional(),
        })
      ),
    })
  ),
  shopping_list: z.union([
    z.record(z.string(), z.array(z.string())),
    z.array(z.record(z.string(), z.unknown())),
  ]),
  workout_plan: z.array(z.record(z.string(), z.unknown())).optional(),
  meal_prep_guide: z.array(z.record(z.string(), z.unknown())).optional(),
  exercise_guide: z.unknown().optional(),
  recommended_products: z.array(z.unknown()).optional(),
});

function buildPrompt(input: PlanGenerationInput, name: string): string {
  const suppText =
    input.herbalife_products.length > 0 && input.other_supplements.length > 0
      ? "Mix of Herbalife and standard supplements"
      : input.herbalife_products.length > 0
        ? "Use Herbalife products (Formula 1, Herbalife 24 range, Rebuild Endurance etc.)"
        : "Standard supplements (whey protein, creatine, omega-3, multivitamin, etc.)";

  return `You are NutriCoach AI, a world-class nutrition and fitness coach. Generate a complete personalised 7-day plan. Return ONLY valid JSON — no markdown fences, no explanation, just raw JSON.

USER:
Name: ${name}, Age: ${input.age}, Weight: ${input.weight_kg}kg, Height: ${input.height_cm}cm
Goal: ${input.goal}, Training: ${input.training_days.join(", ")} (${input.training_days.length} days/week), Activity: ${input.activity_level}
Diet restrictions: ${input.dietary_restrictions.join(", ")}
Available foods (use these): ${input.available_foods.join(", ")}
Supplements: ${suppText}

Return exactly this structure:
{
  "user_stats": { "name": "string", "calorie_target": number, "protein_target_g": number, "carbs_target_g": number, "fat_target_g": number, "water_target_l": number },
  "weekly_plan": [
    { "day": "Monday", "type": "Training",
      "meals": [
        { "type": "Breakfast", "name": "string", "kcal": number, "protein_g": number },
        { "type": "Mid-Morning Snack", "name": "string", "kcal": number, "protein_g": number },
        { "type": "Lunch", "name": "string", "kcal": number, "protein_g": number },
        { "type": "Afternoon Snack", "name": "string", "kcal": number, "protein_g": number },
        { "type": "Dinner", "name": "string", "kcal": number, "protein_g": number }
      ]
    }
  ],
  "supplement_schedule": {
    "morning": [{"name":"string","dose":"string"}],
    "pre_workout": [{"name":"string","dose":"string"}],
    "post_workout": [{"name":"string","dose":"string"}],
    "evening": [{"name":"string","dose":"string"}]
  },
  "shopping_list": {
    "Proteins": ["string"],
    "Carbs & Grains": ["string"],
    "Fruits & Vegetables": ["string"],
    "Dairy & Eggs": ["string"],
    "Supplements": ["string"],
    "Pantry & Fats": ["string"]
  },
  "workout_plan": [
    { "day": "Monday", "type": "Push / Chest & Triceps", "exercises": [{"name":"string","sets":3,"reps":"8-12","notes":"string"}] }
  ],
  "meal_prep_guide": [
    { "step": 1, "instruction": "Batch cook chicken for the week" },
    { "step": 2, "instruction": "Prep rice and vegetables" }
  ],
  "morning_ritual": [
    { "step": 1, "instruction": "Drink Herbal Aloe on empty stomach", "wait_minutes": 15 },
    { "step": 2, "instruction": "Herbal Tea", "wait_minutes": 10 },
    { "step": 3, "instruction": "Formula 1 shake" }
  ],
  "recommended_products": [
    { "name": "string", "description": "string", "benefit": "string", "brand": "string" }
  ]
}

Rules: all 7 days in weekly_plan; ${input.training_days.length} training days (${input.training_days.join(", ")}), rest days labelled "Rest" with no exercises in workout_plan; vary meals throughout week; calorie/protein based on proper TDEE for ${input.goal}. Only include training days in workout_plan (${input.training_days.length} entries). Use the available_foods list to build meals. Include meal_prep_guide (3-5 Sunday prep steps), morning_ritual (steps with optional wait_minutes), and recommended_products (2-4 supplements matched to goal and supplements list).`;
}

function getFriendlyErrorMessage(err: unknown): string {
  const status = (err as { status?: number })?.status;
  const errorObj = (err as { error?: { type?: string } })?.error;
  const message = err instanceof Error ? err.message : String(err);

  if (
    status === 529 ||
    status === 429 ||
    errorObj?.type === "overloaded_error" ||
    message?.includes("Overloaded") ||
    message?.includes("overloaded")
  ) {
    return "AI service is temporarily busy. Please try again in a minute.";
  }

  return err instanceof Error ? err.message : "Plan generation failed";
}

function parsePlanResponse(raw: string): GeneratedPlan {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

  try {
    return JSON.parse(cleaned) as GeneratedPlan;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as GeneratedPlan;
    }
    throw new Error("Could not parse the AI response. Please try again.");
  }
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return apiError(500, "ANTHROPIC_API_KEY is not configured", "CONFIG_ERROR");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipPart = forwardedFor?.split(",")[0]?.trim() || "anonymous";
    const rateKey = user?.id ? `user:${user.id}` : `ip:${ipPart}`;

    const hourly = checkRateLimit(rateKey, 5, 60 * 60 * 1000);
    if (!hourly.allowed) {
      return NextResponse.json(
        {
          error: "Too many plan generation requests. Please try again later.",
          code: "RATE_LIMIT_HOURLY",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(hourly.retryAfterSeconds),
          },
        }
      );
    }
    const daily = checkRateLimit(rateKey, 20, 24 * 60 * 60 * 1000);
    if (!daily.allowed) {
      return NextResponse.json(
        {
          error: "Daily plan generation limit reached. Please try again tomorrow.",
          code: "RATE_LIMIT_DAILY",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(daily.retryAfterSeconds),
          },
        }
      );
    }

    const body = await request.json();
    const { input, name = "You", client_id: requestClientId } = body as {
      input?: PlanGenerationInput;
      name?: string;
      client_id?: string;
    };

    let inputToUse: PlanGenerationInput;
    let clientIdToStore: string | null = null;
    let coachIdToStore: string | null = null;
    let clientUserId: string | null = null;

    if (requestClientId && user) {
      // Coach generating for client: verify coach owns client, load profile
      const { data: coachRow } = await supabase
        .from("coaches")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!coachRow) {
        return apiError(403, "Coach profile not found", "COACH_NOT_FOUND");
      }

      const { data: clientRow } = await supabase
        .from("clients")
        .select("id, user_id")
        .eq("id", requestClientId)
        .eq("coach_id", coachRow.id)
        .single();

      if (!clientRow) {
        return apiError(404, "Client not found or access denied", "CLIENT_NOT_FOUND");
      }

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("weight_kg, height_cm, age, goal, activity_level, training_days, dietary_restrictions, available_foods, supplements, herbalife_products, other_supplements")
        .eq("user_id", clientRow.user_id)
        .single();

      const planInput = profileRow ? profileToPlanInput(profileRow) : null;
      if (!planInput) {
        return apiError(
          400,
          "Client has not completed onboarding. Ask them to fill the form first.",
          "CLIENT_ONBOARDING_INCOMPLETE"
        );
      }

      inputToUse = planInput;
      clientIdToStore = clientRow.id;
      coachIdToStore = coachRow.id;
      clientUserId = clientRow.user_id;
    } else if (input && typeof input === "object") {
      inputToUse = input;
      if (user) {
        const { data: clientRow } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (clientRow) {
          clientIdToStore = clientRow.id;
          const { data: coachRow } = await supabase
            .from("coaches")
            .select("id")
            .eq("user_id", user.id)
            .single();
          coachIdToStore = coachRow?.id ?? null;
          clientUserId = user.id;
        }
      }
    } else {
      return apiError(
        400,
        "Missing or invalid input (or client_id for coach flow)",
        "VALIDATION_ERROR"
      );
    }

    const displayName = name || "You";
    const anthropic = new Anthropic({ apiKey, maxRetries: 5 });
    const prompt = buildPrompt(inputToUse, displayName);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const plan = parsePlanResponse(textContent);
    const validated = GeneratedPlanSchema.safeParse(plan);

    if (!validated.success) {
      return apiError(
        500,
        "Generated plan failed validation",
        "PLAN_VALIDATION_FAILED",
        validated.error.flatten()
      );
    }

    // Optional: Edamam macro validation (when env vars set)
    const macroValidation = await validatePlanMacros(plan);
    const validationWarning =
      macroValidation && !macroValidation.valid ? macroValidation.message : undefined;

    let planId: string | null = null;
    if (clientIdToStore) {
      // Deactivate previous plans for this client
      await supabase
        .from("meal_plans")
        .update({ is_active: false })
        .eq("client_id", clientIdToStore);

      const { data: inserted } = await supabase
        .from("meal_plans")
        .insert({
          client_id: clientIdToStore,
          coach_id: coachIdToStore,
          plan_json: plan,
          week_start_date: new Date().toISOString().slice(0, 10),
          is_active: true,
        })
        .select("id")
        .single();

      planId = inserted?.id ?? null;

      // Update client.current_plan_id when coach generates for client
      if (requestClientId && planId) {
        await supabase
          .from("clients")
          .update({ current_plan_id: planId })
          .eq("id", clientIdToStore);
      }

      // Save profile when client generates own plan (so coach can regenerate later)
      if (clientUserId && !requestClientId) {
        const profilePayload = mapPlanInputToProfile(inputToUse);
        await supabase
          .from("profiles")
          .update({
            weight_kg: profilePayload.weight_kg,
            height_cm: profilePayload.height_cm,
            age: profilePayload.age,
            goal: profilePayload.goal,
            activity_level: profilePayload.activity_level,
            training_days: profilePayload.training_days,
            dietary_restrictions: profilePayload.dietary_restrictions,
            available_foods: profilePayload.available_foods,
            supplements: profilePayload.supplements,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", clientUserId);

        await supabase
          .from("clients")
          .update({ onboarding_complete: true, current_plan_id: planId })
          .eq("user_id", clientUserId);
      }
    }

    return NextResponse.json({
      plan,
      planId,
      validationWarning,
    });
  } catch (err) {
    console.error("Plan generation error:", err);
    const message = getFriendlyErrorMessage(err);
    return apiError(500, message, "PLAN_GENERATION_FAILED");
  }
}
