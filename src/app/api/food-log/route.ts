import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  AddFoodLogPayload,
  DailyFoodSummary,
  FoodLogEntry,
  MealSlot,
} from "@/types/food";
import { MEAL_SLOTS } from "@/types/food";
import { foodLogPayloadSchema, isoDateSchema } from "@/lib/validation";
import { apiError, apiUnexpectedError } from "@/lib/api-response";

// GET /api/food-log?date=2026-02-23
// Returns all food log entries for the authenticated client on a given date,
// grouped by meal slot with daily totals.
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return apiError(401, "Unauthorized", "UNAUTHORIZED");
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    const parsedDate = isoDateSchema.safeParse(date);
    if (!parsedDate.success) {
      return apiError(400, "Invalid date format", "VALIDATION_ERROR");
    }
    // Optional: coach viewing a specific client's log
    const clientIdParam = searchParams.get("client_id");

    let clientId: string;

    if (clientIdParam) {
      // Coach path: verify this user is a coach who owns the client
      const { data: coach } = await supabase
        .from("coaches")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!coach) {
        return apiError(403, "Unauthorized", "FORBIDDEN");
      }
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("id", clientIdParam)
        .eq("coach_id", coach.id)
        .single();
      if (!client) {
        return apiError(404, "Client not found", "CLIENT_NOT_FOUND");
      }
      clientId = client.id;
    } else {
      // Client path
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!client) {
        return apiError(404, "Client profile not found", "CLIENT_NOT_FOUND");
      }
      clientId = client.id;
    }

    const { data: entries, error } = await supabase
      .from("food_log_entries")
      .select("*")
      .eq("client_id", clientId)
      .eq("checkin_date", date)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const typedEntries = (entries ?? []) as FoodLogEntry[];

    // Group by meal slot and compute daily totals
    const entriesByMeal: Partial<Record<MealSlot, FoodLogEntry[]>> = {};
    for (const slot of MEAL_SLOTS) {
      const slotEntries = typedEntries.filter((e) => e.meal_slot === slot);
      if (slotEntries.length > 0) {
        entriesByMeal[slot] = slotEntries;
      }
    }

    const summary: DailyFoodSummary = {
      date,
      total_calories: typedEntries.reduce((s, e) => s + (e.calories ?? 0), 0),
      total_protein_g: typedEntries.reduce((s, e) => s + (e.protein_g ?? 0), 0),
      total_carbs_g: typedEntries.reduce((s, e) => s + (e.carbs_g ?? 0), 0),
      total_fat_g: typedEntries.reduce((s, e) => s + (e.fat_g ?? 0), 0),
      entries_by_meal: entriesByMeal,
    };

    return NextResponse.json(summary);
  } catch (err) {
    return apiUnexpectedError("Food log fetch error:", err, "Failed to fetch food log");
  }
}

// POST /api/food-log
// Adds a single food entry to the log for the authenticated client.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return apiError(401, "Unauthorized", "UNAUTHORIZED");
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!client) {
      return apiError(404, "Client profile not found", "CLIENT_NOT_FOUND");
    }

    const body = (await request.json()) as AddFoodLogPayload;
    const parsedBody = foodLogPayloadSchema.safeParse(body);
    if (!parsedBody.success) {
      return apiError(
        400,
        "Invalid food log payload",
        "VALIDATION_ERROR",
        parsedBody.error.flatten()
      );
    }
    const {
      checkin_date,
      meal_slot,
      food_name,
      brand,
      serving_size,
      serving_unit,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      fiber_g,
      source,
      source_id,
      barcode,
    } = parsedBody.data;

    const { data: entry, error } = await supabase
      .from("food_log_entries")
      .insert({
        client_id: client.id,
        checkin_date,
        meal_slot,
        food_name,
        brand: brand ?? null,
        serving_size: serving_size ?? null,
        serving_unit: serving_unit ?? "g",
        calories: calories ?? 0,
        protein_g: protein_g ?? 0,
        carbs_g: carbs_g ?? 0,
        fat_g: fat_g ?? 0,
        fiber_g: fiber_g ?? null,
        source: source ?? "manual",
        source_id: source_id ?? null,
        barcode: barcode ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    return apiUnexpectedError("Food log insert error:", err, "Failed to log food");
  }
}

// DELETE /api/food-log?id=uuid
// Removes a food log entry belonging to the authenticated client.
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return apiError(401, "Unauthorized", "UNAUTHORIZED");
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return apiError(400, "id is required", "VALIDATION_ERROR");
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!client) {
      return apiError(404, "Client profile not found", "CLIENT_NOT_FOUND");
    }

    const { error } = await supabase
      .from("food_log_entries")
      .delete()
      .eq("id", id)
      .eq("client_id", client.id); // ensures users can only delete their own entries

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiUnexpectedError(
      "Food log delete error:",
      err,
      "Failed to delete food log entry"
    );
  }
}
