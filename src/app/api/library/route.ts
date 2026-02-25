import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
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
  const type = searchParams.get("type");
  const search = searchParams.get("search") ?? "";

  let query = supabase
    .from("library_items")
    .select("*")
    .eq("coach_id", coach.id)
    .order("updated_at", { ascending: false });

  if (type) query = query.eq("type", type);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error } = await query;
  if (error) return apiError(500, "Failed to fetch library items", "LIBRARY_FETCH_FAILED");

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

  const body = await req.json();
  const { type, title, content } = body;

  if (!type || !title) {
    return apiError(400, "type and title are required", "VALIDATION_ERROR");
  }

  const validTypes = ["workout", "exercise", "meal", "video", "text"];
  if (!validTypes.includes(type)) {
    return apiError(400, "Invalid type", "VALIDATION_ERROR");
  }

  const { data, error } = await supabase
    .from("library_items")
    .insert({ coach_id: coach.id, type, title: title.trim(), content: content ?? null })
    .select()
    .single();

  if (error) return apiError(500, "Failed to create library item", "LIBRARY_CREATE_FAILED");
  return NextResponse.json(data, { status: 201 });
}
