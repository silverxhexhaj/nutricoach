import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";

async function getCoachAndVerifyItem(
  supabase: Awaited<ReturnType<typeof createClient>>,
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
    .from("library_items")
    .select("id, coach_id")
    .eq("id", itemId)
    .single();
  if (!item) return { error: "Library item not found", status: 404 };
  if (item.coach_id !== coach.id) return { error: "Forbidden", status: 403 };

  return { coach, item };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!coach) return apiError(404, "Coach not found", "COACH_NOT_FOUND");

  const { data: item, error } = await supabase
    .from("library_items")
    .select("*")
    .eq("id", id)
    .eq("coach_id", coach.id)
    .single();

  if (error || !item) return apiError(404, "Library item not found", "LIBRARY_ITEM_NOT_FOUND");
  return NextResponse.json(item);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

  const check = await getCoachAndVerifyItem(supabase, id, user.id);
  if ("error" in check) return apiError(check.status, check.error);

  const body = await req.json();
  const { type, title, content } = body;

  const validTypes = ["workout", "exercise", "meal", "video", "text"];
  if (type !== undefined && !validTypes.includes(type)) {
    return apiError(400, "Invalid type", "VALIDATION_ERROR");
  }

  const updateData: Record<string, unknown> = {};
  if (type !== undefined) updateData.type = type;
  if (title !== undefined) updateData.title = title.trim();
  if (content !== undefined) updateData.content = content;

  const { data, error } = await supabase
    .from("library_items")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return apiError(500, "Failed to update library item", "LIBRARY_ITEM_UPDATE_FAILED");
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

  const check = await getCoachAndVerifyItem(supabase, id, user.id);
  if ("error" in check) return apiError(check.status, check.error);

  const { error } = await supabase.from("library_items").delete().eq("id", id);
  if (error) return apiError(500, "Failed to delete library item", "LIBRARY_ITEM_DELETE_FAILED");

  return NextResponse.json({ success: true });
}
