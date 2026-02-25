import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkinPayloadSchema, isoDateSchema } from "@/lib/validation";
import { apiError, apiUnexpectedError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return apiError(401, "Unauthorized", "UNAUTHORIZED");
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (from) {
      const parsedFrom = isoDateSchema.safeParse(from);
      if (!parsedFrom.success) {
        return apiError(400, "Invalid from date format", "VALIDATION_ERROR");
      }
    }
    if (to) {
      const parsedTo = isoDateSchema.safeParse(to);
      if (!parsedTo.success) {
        return apiError(400, "Invalid to date format", "VALIDATION_ERROR");
      }
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!client) {
      return apiError(404, "Client profile not found", "CLIENT_NOT_FOUND");
    }

    let query = supabase
      .from("checkins")
      .select("date, weight_kg, water_ml, calories, protein_g, workout_done, energy_level, notes")
      .eq("client_id", client.id)
      .order("date", { ascending: true });

    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json({ checkins: data ?? [] });
  } catch (err) {
    return apiUnexpectedError("Check-ins fetch error:", err, "Failed to fetch check-ins");
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return apiError(401, "Unauthorized", "UNAUTHORIZED");
    }

    const body = await request.json();
    const parsedBody = checkinPayloadSchema.safeParse(body);
    if (!parsedBody.success) {
      return apiError(
        400,
        "Invalid check-in payload",
        "VALIDATION_ERROR",
        parsedBody.error.flatten()
      );
    }
    const { weight_kg, water_ml, calories, protein_g, workout_done, energy_level, notes, date } =
      parsedBody.data;

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!client) {
      return apiError(404, "Client profile not found", "CLIENT_NOT_FOUND");
    }

    const checkinDate = date ?? new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from("checkins").upsert(
      {
        client_id: client.id,
        date: checkinDate,
        weight_kg: weight_kg ?? null,
        water_ml: water_ml ?? null,
        calories: calories ?? null,
        protein_g: protein_g ?? null,
        workout_done: workout_done ?? null,
        energy_level: energy_level ?? null,
        notes: notes?.trim() || null,
      },
      { onConflict: "client_id,date" }
    );

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiUnexpectedError("Check-in error:", err, "Failed to save check-in");
  }
}
