import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!coach) {
      return NextResponse.json({ error: "Coach profile not found" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const { data: clients } = await supabase
      .from("clients")
      .select("id")
      .eq("coach_id", coach.id);

    const clientIds = clients?.map((c) => c.id) ?? [];
    if (clientIds.length === 0) {
      return NextResponse.json({ checkins: [], totalClients: 0 });
    }

    let query = supabase
      .from("checkins")
      .select("date, client_id")
      .in("client_id", clientIds)
      .order("date", { ascending: true });

    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);

    const { data: checkins, error } = await query;

    if (error) throw error;

    const byDate = new Map<string, string[]>();
    for (const c of checkins ?? []) {
      const list = byDate.get(c.date) ?? [];
      list.push(c.client_id);
      byDate.set(c.date, list);
    }

    const dates = Array.from(byDate.entries()).map(([date, client_ids]) => ({
      date,
      client_ids,
      count: client_ids.length,
    }));

    return NextResponse.json({
      checkins: dates,
      totalClients: clientIds.length,
    });
  } catch (err) {
    console.error("Coach check-ins fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}
