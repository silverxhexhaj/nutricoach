import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: programId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!coach) return apiError(404, "Coach not found", "COACH_NOT_FOUND");

  // Verify program ownership
  const { data: program } = await supabase
    .from("programs")
    .select("id")
    .eq("id", programId)
    .eq("coach_id", coach.id)
    .single();
  if (!program) return apiError(404, "Program not found", "PROGRAM_NOT_FOUND");

  const body = await req.json();
  const { program_day_id, type, title, content, sort_order } = body;

  if (!program_day_id || !type || !title) {
    return apiError(400, "program_day_id, type, and title are required", "VALIDATION_ERROR");
  }

  // Verify the day belongs to the program
  const { data: day } = await supabase
    .from("program_days")
    .select("id")
    .eq("id", program_day_id)
    .eq("program_id", programId)
    .single();
  if (!day) return apiError(404, "Day not found", "PROGRAM_DAY_NOT_FOUND");

  // Get next sort_order if not provided
  let finalSortOrder = sort_order ?? 0;
  if (sort_order === undefined) {
    const { data: existing } = await supabase
      .from("program_items")
      .select("sort_order")
      .eq("program_day_id", program_day_id)
      .order("sort_order", { ascending: false })
      .limit(1);
    finalSortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;
  }

  const { data, error } = await supabase
    .from("program_items")
    .insert({ program_day_id, type, title, content: content ?? null, sort_order: finalSortOrder })
    .select()
    .single();

  if (error) return apiError(500, "Failed to create program item", "PROGRAM_ITEM_CREATE_FAILED");
  return NextResponse.json(data, { status: 201 });
}
