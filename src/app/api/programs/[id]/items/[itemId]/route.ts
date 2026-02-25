import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";

async function verifyItemOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  programId: string,
  itemId: string,
  userId: string
) {
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", userId)
    .single();
  if (!coach) return { error: "Coach not found", status: 404 };

  const { data: item } = await supabase
    .from("program_items")
    .select("id, program_day_id")
    .eq("id", itemId)
    .single();
  if (!item) return { error: "Item not found", status: 404 };

  // Verify the day belongs to the program, and the program belongs to the coach
  const { data: day } = await supabase
    .from("program_days")
    .select("id, program_id")
    .eq("id", item.program_day_id)
    .eq("program_id", programId)
    .single();
  if (!day) return { error: "Item not found", status: 404 };

  const { data: program } = await supabase
    .from("programs")
    .select("id")
    .eq("id", programId)
    .eq("coach_id", coach.id)
    .single();
  if (!program) return { error: "Forbidden", status: 403 };

  return { item };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const { id: programId, itemId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

  const check = await verifyItemOwnership(supabase, programId, itemId, user.id);
  if ("error" in check) return apiError(check.status, check.error);

  const body = await req.json();
  const { type, title, content, sort_order } = body;

  const updateData: Record<string, unknown> = {};
  if (type !== undefined) updateData.type = type;
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (sort_order !== undefined) updateData.sort_order = sort_order;

  const { data, error } = await supabase
    .from("program_items")
    .update(updateData)
    .eq("id", itemId)
    .select()
    .single();

  if (error) return apiError(500, "Failed to update program item", "PROGRAM_ITEM_UPDATE_FAILED");
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const { id: programId, itemId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

  const check = await verifyItemOwnership(supabase, programId, itemId, user.id);
  if ("error" in check) return apiError(check.status, check.error);

  const { error } = await supabase.from("program_items").delete().eq("id", itemId);
  if (error) return apiError(500, "Failed to delete program item", "PROGRAM_ITEM_DELETE_FAILED");

  return NextResponse.json({ success: true });
}
