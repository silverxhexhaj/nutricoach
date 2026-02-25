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
    const programItemIds = searchParams.get("programItemIds")?.split(",").filter(Boolean);

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
      .from("program_item_completions")
      .select("program_item_id, completed_at")
      .eq("client_program_id", clientProgramId);

    if (programItemIds?.length) {
      query = query.in("program_item_id", programItemIds);
    }

    const { data, error } = await query;

    if (error) throw error;

    const completions: Record<string, string> = {};
    for (const row of data ?? []) {
      completions[row.program_item_id] = row.completed_at;
    }

    return NextResponse.json({ completions });
  } catch (err) {
    console.error("Program item completions fetch error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to fetch item completions",
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
      programItemId,
      overrideId,
      completed,
    } = body as {
      clientProgramId?: string;
      programItemId?: string;
      overrideId?: string;
      completed?: boolean;
    };

    if (!clientProgramId || (!programItemId && !overrideId) || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "clientProgramId, (programItemId or overrideId), and completed are required" },
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

    if (programItemId) {
      const { data: itemOwnership } = await supabase
        .from("program_items")
        .select("id, program_days!inner(program_id)")
        .eq("id", programItemId)
        .eq("program_days.program_id", ownership.programId)
        .single();
      if (!itemOwnership) {
        return NextResponse.json(
          { error: "Program item does not belong to assigned program" },
          { status: 400 }
        );
      }
    }

    if (overrideId) {
      const { data: overrideOwnership } = await supabase
        .from("client_program_item_overrides")
        .select("id")
        .eq("id", overrideId)
        .eq("client_program_id", clientProgramId)
        .single();
      if (!overrideOwnership) {
        return NextResponse.json(
          { error: "Override does not belong to this client program" },
          { status: 400 }
        );
      }
    }

    if (completed) {
      if (programItemId && !overrideId) {
        // Template item: use the original unique constraint for upsert
        const { error } = await supabase
          .from("program_item_completions")
          .upsert(
            {
              client_program_id: clientProgramId,
              program_item_id: programItemId,
              completed_at: new Date().toISOString(),
            },
            { onConflict: "client_program_id,program_item_id" }
          );
        if (error) throw error;
      } else if (overrideId) {
        // Override item: partial unique index can't be used with onConflict,
        // so do a manual check-then-insert.
        const { data: existing } = await supabase
          .from("program_item_completions")
          .select("id")
          .eq("client_program_id", clientProgramId)
          .eq("override_id", overrideId)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from("program_item_completions")
            .update({ completed_at: new Date().toISOString() })
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          const insertData: Record<string, unknown> = {
            client_program_id: clientProgramId,
            override_id: overrideId,
            completed_at: new Date().toISOString(),
          };
          if (programItemId) insertData.program_item_id = programItemId;
          const { error } = await supabase
            .from("program_item_completions")
            .insert(insertData);
          if (error) throw error;
        }
      }
    } else {
      let query = supabase
        .from("program_item_completions")
        .delete()
        .eq("client_program_id", clientProgramId);

      if (programItemId) {
        query = query.eq("program_item_id", programItemId);
      }
      if (overrideId) {
        query = query.eq("override_id", overrideId);
      }

      const { error } = await query;
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Program item completion error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to save item completion",
      },
      { status: 500 }
    );
  }
}
