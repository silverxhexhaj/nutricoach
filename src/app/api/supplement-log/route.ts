import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupplementLogEntry, UpsertSupplementLogPayload } from "@/types/activity";

// GET /api/supplement-log?date=2026-02-23
// GET /api/supplement-log?date=2026-02-23&client_id=uuid  (coach viewing client)
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
      .from("supplement_logs")
      .select("*")
      .eq("client_id", clientId)
      .eq("date", date)
      .order("time_slot", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ entries: (entries ?? []) as SupplementLogEntry[] });
  } catch (err) {
    console.error("Supplement log fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch supplement logs" },
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

    const body = (await request.json()) as UpsertSupplementLogPayload;
    const { date, supplement_name, dose, time_slot, taken, taken_at, notes } = body;

    if (!date || !supplement_name || !time_slot) {
      return NextResponse.json(
        { error: "date, supplement_name, and time_slot are required" },
        { status: 400 }
      );
    }

    const payload = {
      client_id: client.id,
      date,
      supplement_name,
      dose: dose ?? null,
      time_slot,
      taken: taken ?? false,
      taken_at: taken ? (taken_at ?? new Date().toISOString()) : null,
      notes: notes ?? null,
    };

    const { data: entry, error } = await supabase
      .from("supplement_logs")
      .upsert(payload, {
        onConflict: "client_id,date,supplement_name,time_slot",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ entry: entry as SupplementLogEntry }, { status: 200 });
  } catch (err) {
    console.error("Supplement log upsert error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save supplement log" },
      { status: 500 }
    );
  }
}
