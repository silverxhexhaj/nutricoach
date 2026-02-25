import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";

type VerifyResult =
  | { success: false; error: string; status: number; code: string }
  | { success: true; coach: { id: string } };

async function getCoachAndProgram(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  programId: string
): Promise<VerifyResult> {
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", userId)
    .single();
  if (!coach) return { success: false, error: "Coach not found", status: 404, code: "COACH_NOT_FOUND" };

  const { data: program } = await supabase
    .from("programs")
    .select("id")
    .eq("id", programId)
    .eq("coach_id", coach.id)
    .single();
  if (!program) return { success: false, error: "Program not found", status: 404, code: "PROGRAM_NOT_FOUND" };

  return { success: true, coach };
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: programId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

  const check = await getCoachAndProgram(supabase, user.id, programId);
  if (!check.success) return apiError(check.status, check.error, check.code);
  const { coach } = check;

  const body = await req.json();
  const { client_id, start_date } = body;

  if (!client_id || !start_date) {
    return apiError(400, "client_id and start_date are required", "VALIDATION_ERROR");
  }

  // Verify client belongs to this coach
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", client_id)
    .eq("coach_id", coach.id)
    .single();
  if (!client) return apiError(404, "Client not found", "CLIENT_NOT_FOUND");

  // Deactivate any existing active assignments for this client + program
  await supabase
    .from("client_programs")
    .update({ is_active: false })
    .eq("client_id", client_id)
    .eq("program_id", programId)
    .eq("is_active", true);

  const { data, error } = await supabase
    .from("client_programs")
    .insert({ client_id, program_id: programId, start_date, is_active: true })
    .select()
    .single();

  if (error) return apiError(500, "Failed to assign program", "PROGRAM_ASSIGN_FAILED");
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: programId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

  const check = await getCoachAndProgram(supabase, user.id, programId);
  if (!check.success) return apiError(check.status, check.error, check.code);
  const { coach } = check;

  const body = await req.json().catch(() => null);
  const clientProgramId = body?.clientProgramId as string | undefined;
  if (!clientProgramId) {
    return apiError(400, "clientProgramId is required", "VALIDATION_ERROR");
  }

  const { data: assignment } = await supabase
    .from("client_programs")
    .select("id, client_id")
    .eq("id", clientProgramId)
    .eq("program_id", programId)
    .eq("is_active", true)
    .single();
  if (!assignment) {
    return apiError(404, "Active assignment not found", "ASSIGNMENT_NOT_FOUND");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", assignment.client_id)
    .eq("coach_id", coach.id)
    .single();
  if (!client) return apiError(403, "Forbidden", "FORBIDDEN");

  const { error } = await supabase
    .from("client_programs")
    .update({ is_active: false })
    .eq("id", clientProgramId);
  if (error) return apiError(500, "Failed to unassign client", "PROGRAM_UNASSIGN_FAILED");

  return NextResponse.json({ success: true });
}
