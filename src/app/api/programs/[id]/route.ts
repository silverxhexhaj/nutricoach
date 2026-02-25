import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";

type VerifyResult =
  | { success: false; error: string; status: number }
  | { success: true; coach: { id: string }; program: { id: string; coach_id: string } };

async function getCoachAndVerifyProgram(
  supabase: Awaited<ReturnType<typeof createClient>>,
  programId: string,
  userId: string
): Promise<VerifyResult> {
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", userId)
    .single();
  if (!coach) return { success: false, error: "Coach not found", status: 404 };

  const { data: program } = await supabase
    .from("programs")
    .select("id, coach_id")
    .eq("id", programId)
    .single();
  if (!program) return { success: false, error: "Program not found", status: 404 };
  if (program.coach_id !== coach.id) return { success: false, error: "Forbidden", status: 403 };

  return { success: true, coach, program };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const { data: program, error: programError } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .eq("coach_id", coach.id)
    .single();

  if (programError || !program) return apiError(404, "Program not found", "PROGRAM_NOT_FOUND");

  // Fetch days with items
  const { data: days } = await supabase
    .from("program_days")
    .select("*, program_items(*)")
    .eq("program_id", id)
    .order("day_number", { ascending: true });

  const daysWithItems = (days ?? []).map((day) => ({
    ...day,
    items: (day.program_items ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    ),
  }));

  return NextResponse.json({ ...program, days: daysWithItems });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

  const check = await getCoachAndVerifyProgram(supabase, id, user.id);
  if (!check.success) return apiError(check.status, check.error);

  const body = await req.json();
  const { name, description, tags, difficulty, days_per_week, duration_weeks, start_day, color } = body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (tags !== undefined) updateData.tags = tags;
  if (difficulty !== undefined) updateData.difficulty = difficulty;
  if (days_per_week !== undefined) updateData.days_per_week = days_per_week;
  if (duration_weeks !== undefined) updateData.duration_weeks = duration_weeks;
  if (start_day !== undefined) updateData.start_day = start_day;
  if (color !== undefined) updateData.color = color;

  const { data, error } = await supabase
    .from("programs")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return apiError(500, "Failed to update program", "PROGRAM_UPDATE_FAILED");
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

  const check = await getCoachAndVerifyProgram(supabase, id, user.id);
  if (!check.success) return apiError(check.status, check.error);

  const forceDelete = req.nextUrl.searchParams.get("force") === "true";
  const { count: activeAssignmentCount, error: assignmentError } = await supabase
    .from("client_programs")
    .select("id", { count: "exact", head: true })
    .eq("program_id", id)
    .eq("is_active", true);

  if (assignmentError) {
    return apiError(500, "Failed to verify active assignments", "PROGRAM_DELETE_GUARD_FAILED");
  }

  if ((activeAssignmentCount ?? 0) > 0 && !forceDelete) {
    return apiError(
      409,
      `Program is actively assigned to ${activeAssignmentCount} client${activeAssignmentCount === 1 ? "" : "s"}. Unassign clients first or confirm force delete.`,
      "PROGRAM_HAS_ACTIVE_ASSIGNMENTS",
      { activeAssignmentCount }
    );
  }

  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) return apiError(500, "Failed to delete program", "PROGRAM_DELETE_FAILED");

  return NextResponse.json({ success: true });
}
