import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function verifyClientOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  clientProgramId: string
) {
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!client) return null;

  const { data: assignment } = await supabase
    .from("client_programs")
    .select("id, program_id")
    .eq("id", clientProgramId)
    .eq("client_id", client.id)
    .eq("is_active", true)
    .single();

  if (!assignment) return null;
  return {
    clientId: client.id,
    programId: assignment.program_id,
  };
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientProgramId = searchParams.get("clientProgramId");
    const programDayIds = searchParams.get("programDayIds")?.split(",").filter(Boolean);

    if (!clientProgramId) {
      return NextResponse.json(
        { error: "clientProgramId is required" },
        { status: 400 }
      );
    }

    const ownership = await verifyClientOwnership(supabase, user.id, clientProgramId);
    if (!ownership) {
      return NextResponse.json(
        { error: "Client program not found or access denied" },
        { status: 403 }
      );
    }

    let query = supabase
      .from("program_day_completions")
      .select("program_day_id, completed_at")
      .eq("client_program_id", clientProgramId);

    if (programDayIds?.length) {
      query = query.in("program_day_id", programDayIds);
    }

    const { data, error } = await query;

    if (error) throw error;

    const completions: Record<string, string> = {};
    for (const row of data ?? []) {
      completions[row.program_day_id] = row.completed_at;
    }

    return NextResponse.json({ completions });
  } catch (err) {
    console.error("Program day completions fetch error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to fetch day completions",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      clientProgramId,
      programDayId,
      completed,
    } = body as {
      clientProgramId?: string;
      programDayId?: string;
      completed?: boolean;
    };

    if (!clientProgramId || !programDayId || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "clientProgramId, programDayId, and completed are required" },
        { status: 400 }
      );
    }

    const ownership = await verifyClientOwnership(supabase, user.id, clientProgramId);
    if (!ownership) {
      return NextResponse.json(
        { error: "Client program not found or access denied" },
        { status: 403 }
      );
    }

    const { data: dayOwnership } = await supabase
      .from("program_days")
      .select("id")
      .eq("id", programDayId)
      .eq("program_id", ownership.programId)
      .single();
    if (!dayOwnership) {
      return NextResponse.json(
        { error: "Program day does not belong to assigned program" },
        { status: 400 }
      );
    }

    if (completed) {
      const { error } = await supabase.from("program_day_completions").upsert(
        {
          client_program_id: clientProgramId,
          program_day_id: programDayId,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "client_program_id,program_day_id" }
      );
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("program_day_completions")
        .delete()
        .eq("client_program_id", clientProgramId)
        .eq("program_day_id", programDayId);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Program day completion error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to save day completion",
      },
      { status: 500 }
    );
  }
}
