import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: programId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!coach)
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });

    const { data: program } = await supabase
      .from("programs")
      .select("id")
      .eq("id", programId)
      .eq("coach_id", coach.id)
      .single();
    if (!program)
      return NextResponse.json({ error: "Program not found" }, { status: 404 });

    const clientProgramId = req.nextUrl.searchParams.get("clientProgramId");

    // Build base filter for active assignments on this program
    let cpFilter = supabase
      .from("client_programs")
      .select("id, client_id")
      .eq("program_id", programId)
      .eq("is_active", true);

    if (clientProgramId) {
      cpFilter = cpFilter.eq("id", clientProgramId);
    }

    const { data: assignments } = await cpFilter;
    if (!assignments?.length) {
      return NextResponse.json({ feed: [] });
    }

    const cpIds = assignments.map((a) => a.id);
    const clientIds = Array.from(new Set(assignments.map((a) => a.client_id)));

    // Fetch client names
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name")
      .in("id", clientIds);
    const nameMap = new Map(
      (clients ?? []).map((c) => [c.id, c.name ?? "Unnamed client"])
    );
    const cpToClient = new Map(assignments.map((a) => [a.id, a.client_id]));

    // Fetch day completions + item completions in parallel
    const [dayRes, itemRes] = await Promise.all([
      supabase
        .from("program_day_completions")
        .select("id, client_program_id, program_day_id, completed_at")
        .in("client_program_id", cpIds)
        .order("completed_at", { ascending: false })
        .limit(50),
      supabase
        .from("program_item_completions")
        .select("id, client_program_id, program_item_id, override_id, completed_at")
        .in("client_program_id", cpIds)
        .order("completed_at", { ascending: false })
        .limit(50),
    ]);

    // Fetch day numbers for completed days
    const dayIds = Array.from(
      new Set((dayRes.data ?? []).map((d) => d.program_day_id))
    );
    const { data: dayRows } = dayIds.length
      ? await supabase
          .from("program_days")
          .select("id, day_number")
          .in("id", dayIds)
      : { data: [] };
    const dayNumberMap = new Map(
      (dayRows ?? []).map((d) => [d.id, d.day_number])
    );

    // Fetch item titles
    const itemIds = Array.from(
      new Set(
        (itemRes.data ?? [])
          .map((i) => i.program_item_id)
          .filter(Boolean) as string[]
      )
    );
    const overrideIds = Array.from(
      new Set(
        (itemRes.data ?? [])
          .map((i) => i.override_id)
          .filter(Boolean) as string[]
      )
    );

    const [{ data: itemRows }, { data: overrideRows }] = await Promise.all([
      itemIds.length
        ? supabase
            .from("program_items")
            .select("id, title, type")
            .in("id", itemIds)
        : Promise.resolve({ data: [] as { id: string; title: string; type: string }[] }),
      overrideIds.length
        ? supabase
            .from("client_program_item_overrides")
            .select("id, title, type")
            .in("id", overrideIds)
        : Promise.resolve({ data: [] as { id: string; title: string | null; type: string | null }[] }),
    ]);

    const itemTitleMap = new Map(
      (itemRows ?? []).map((i) => [i.id, { title: i.title, type: i.type }])
    );
    const overrideTitleMap = new Map(
      (overrideRows ?? []).map((i) => [
        i.id,
        { title: i.title ?? "Custom item", type: i.type ?? "text" },
      ])
    );

    type FeedEntry = {
      id: string;
      clientName: string;
      clientId: string;
      type: "day_completed" | "item_completed";
      itemTitle?: string;
      itemType?: string;
      dayNumber?: number;
      completedAt: string;
    };

    const feed: FeedEntry[] = [];

    for (const d of dayRes.data ?? []) {
      const clientId = cpToClient.get(d.client_program_id) ?? "";
      feed.push({
        id: d.id,
        clientName: nameMap.get(clientId) ?? "Unknown",
        clientId,
        type: "day_completed",
        dayNumber: dayNumberMap.get(d.program_day_id),
        completedAt: d.completed_at,
      });
    }

    for (const i of itemRes.data ?? []) {
      const clientId = cpToClient.get(i.client_program_id) ?? "";
      const itemInfo = i.program_item_id
        ? itemTitleMap.get(i.program_item_id)
        : i.override_id
          ? overrideTitleMap.get(i.override_id)
          : undefined;

      feed.push({
        id: i.id,
        clientName: nameMap.get(clientId) ?? "Unknown",
        clientId,
        type: "item_completed",
        itemTitle: itemInfo?.title,
        itemType: itemInfo?.type,
        completedAt: i.completed_at,
      });
    }

    feed.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    return NextResponse.json({ feed: feed.slice(0, 50) });
  } catch (err) {
    console.error("Activity feed error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to fetch activity feed",
      },
      { status: 500 }
    );
  }
}
