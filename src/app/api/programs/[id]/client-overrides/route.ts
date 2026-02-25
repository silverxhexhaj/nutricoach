import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function verifyCoachOwnsProgram(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  programId: string
) {
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", userId)
    .single();
  if (!coach) return null;

  const { data: program } = await supabase
    .from("programs")
    .select("id")
    .eq("id", programId)
    .eq("coach_id", coach.id)
    .single();
  if (!program) return null;

  return { coachId: coach.id };
}

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

    const ownership = await verifyCoachOwnsProgram(supabase, user.id, programId);
    if (!ownership)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const clientProgramId = req.nextUrl.searchParams.get("clientProgramId");
    if (!clientProgramId)
      return NextResponse.json(
        { error: "clientProgramId is required" },
        { status: 400 }
      );

    const { data, error } = await supabase
      .from("client_program_item_overrides")
      .select("*")
      .eq("client_program_id", clientProgramId);

    if (error) throw error;
    return NextResponse.json({ overrides: data ?? [] });
  } catch (err) {
    console.error("Fetch overrides error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch overrides" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const ownership = await verifyCoachOwnsProgram(supabase, user.id, programId);
    if (!ownership)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { clientProgramId, dayId, action, sourceItemId, type, title, content, sortOrder } =
      body as {
        clientProgramId: string;
        dayId: string;
        action: "add" | "replace" | "hide";
        sourceItemId?: string;
        type?: string;
        title?: string;
        content?: Record<string, unknown>;
        sortOrder?: number;
      };

    if (!clientProgramId || !dayId || !action) {
      return NextResponse.json(
        { error: "clientProgramId, dayId, and action are required" },
        { status: 400 }
      );
    }

    if (action === "add" && (!type || !title)) {
      return NextResponse.json(
        { error: "type and title are required for add overrides" },
        { status: 400 }
      );
    }

    if ((action === "replace" || action === "hide") && !sourceItemId) {
      return NextResponse.json(
        { error: "sourceItemId is required for replace/hide overrides" },
        { status: 400 }
      );
    }

    // Verify the client_program belongs to a client of this coach
    const { data: cp } = await supabase
      .from("client_programs")
      .select("id, program_id")
      .eq("id", clientProgramId)
      .eq("program_id", programId)
      .single();
    if (!cp)
      return NextResponse.json(
        { error: "Client program not found for this program" },
        { status: 404 }
      );

    const insertData: Record<string, unknown> = {
      client_program_id: clientProgramId,
      program_day_id: dayId,
      action,
    };
    if (sourceItemId) insertData.source_item_id = sourceItemId;
    if (type) insertData.type = type;
    if (title) insertData.title = title;
    if (content) insertData.content = content;
    if (sortOrder !== undefined) insertData.sort_order = sortOrder;

    const { data, error } = await supabase
      .from("client_program_item_overrides")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Create override error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create override" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const ownership = await verifyCoachOwnsProgram(supabase, user.id, programId);
    if (!ownership)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { overrideId, title, content, type, sortOrder } = body as {
      overrideId: string;
      title?: string;
      content?: Record<string, unknown>;
      type?: string;
      sortOrder?: number;
    };

    if (!overrideId)
      return NextResponse.json(
        { error: "overrideId is required" },
        { status: 400 }
      );

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (sortOrder !== undefined) updateData.sort_order = sortOrder;

    const { data, error } = await supabase
      .from("client_program_item_overrides")
      .update(updateData)
      .eq("id", overrideId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Update override error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update override" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const ownership = await verifyCoachOwnsProgram(supabase, user.id, programId);
    if (!ownership)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { overrideId } = body as { overrideId: string };

    if (!overrideId)
      return NextResponse.json(
        { error: "overrideId is required" },
        { status: 400 }
      );

    const { error } = await supabase
      .from("client_program_item_overrides")
      .delete()
      .eq("id", overrideId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete override error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete override" },
      { status: 500 }
    );
  }
}
