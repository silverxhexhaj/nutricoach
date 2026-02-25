import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { programCreatePayloadSchema } from "@/lib/validation";
import { apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!coach) return apiError(404, "Coach not found", "COACH_NOT_FOUND");

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const difficulty = searchParams.get("difficulty");
  const daysPerWeek = searchParams.get("days_per_week");
  const parsedDifficulty = difficulty ? Number.parseInt(difficulty, 10) : null;
  const parsedDaysPerWeek = daysPerWeek ? Number.parseInt(daysPerWeek, 10) : null;

  if (parsedDifficulty !== null && (!Number.isInteger(parsedDifficulty) || parsedDifficulty < 1 || parsedDifficulty > 3)) {
    return apiError(400, "Invalid difficulty filter", "VALIDATION_ERROR");
  }
  if (parsedDaysPerWeek !== null && (!Number.isInteger(parsedDaysPerWeek) || parsedDaysPerWeek < 1 || parsedDaysPerWeek > 7)) {
    return apiError(400, "Invalid days_per_week filter", "VALIDATION_ERROR");
  }

  let query = supabase
    .from("programs")
    .select("*")
    .eq("coach_id", coach.id)
    .order("created_at", { ascending: false });

  if (search) query = query.ilike("name", `%${search}%`);
  if (parsedDifficulty) query = query.eq("difficulty", parsedDifficulty);
  if (parsedDaysPerWeek) query = query.eq("days_per_week", parsedDaysPerWeek);

  const { data, error } = await query;
  if (error) return apiError(500, "Failed to fetch programs", "PROGRAMS_FETCH_FAILED");

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!coach) return apiError(404, "Coach not found", "COACH_NOT_FOUND");

  const parsedBody = programCreatePayloadSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return apiError(
      400,
      "Invalid program payload",
      "VALIDATION_ERROR",
      parsedBody.error.flatten()
    );
  }
  const { name, description, tags, difficulty, days_per_week, duration_weeks, start_day, color } =
    parsedBody.data;

  const { data: program, error: programError } = await supabase
    .from("programs")
    .insert({
      coach_id: coach.id,
      name,
      description: description ?? null,
      tags: tags ?? [],
      difficulty: difficulty ?? 1,
      days_per_week: days_per_week ?? null,
      duration_weeks: duration_weeks ?? 1,
      start_day: start_day ?? "monday",
      color: color ?? "#B8F04A",
    })
    .select()
    .single();

  if (programError) return apiError(500, "Failed to create program", "PROGRAM_CREATE_FAILED");

  // Auto-create days based on duration_weeks * 7
  const totalDays = (duration_weeks ?? 1) * 7;
  const dayRows = Array.from({ length: totalDays }, (_, i) => ({
    program_id: program.id,
    day_number: i + 1,
    label: null,
  }));

  await supabase.from("program_days").insert(dayRows);

  return NextResponse.json(program, { status: 201 });
}
