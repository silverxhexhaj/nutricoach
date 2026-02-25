import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ExerciseLogEntry, UpsertExerciseLogPayload } from "@/types/activity";

// GET /api/exercise-log?date=2026-02-23
// GET /api/exercise-log?date=2026-02-23&client_id=uuid  (coach viewing client)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
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
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("id", clientIdParam)
        .eq("coach_id", coach.id)
        .single();
      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
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
        return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
      }
      clientId = client.id;
    }

    const { data: entries, error } = await supabase
      .from("exercise_logs")
      .select("*")
      .eq("client_id", clientId)
      .eq("date", date)
      .order("exercise_name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ entries: (entries ?? []) as ExerciseLogEntry[] });
  } catch (err) {
    console.error("Exercise log fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch exercise logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    }

    const body = (await request.json()) as UpsertExerciseLogPayload;
    const {
      date,
      exercise_name,
      planned_sets,
      planned_reps,
      completed,
      actual_sets,
      actual_reps,
      notes,
    } = body;

    if (!date || !exercise_name) {
      return NextResponse.json(
        { error: "date and exercise_name are required" },
        { status: 400 }
      );
    }

    const payload = {
      client_id: client.id,
      date,
      exercise_name,
      planned_sets: planned_sets ?? null,
      planned_reps: planned_reps ?? null,
      completed: completed ?? false,
      actual_sets: actual_sets ?? null,
      actual_reps: actual_reps ?? null,
      notes: notes ?? null,
    };

    const { data: entry, error } = await supabase
      .from("exercise_logs")
      .upsert(payload, {
        onConflict: "client_id,date,exercise_name",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ entry: entry as ExerciseLogEntry }, { status: 200 });
  } catch (err) {
    console.error("Exercise log upsert error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save exercise log" },
      { status: 500 }
    );
  }
}
