import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";

const PERSONAL_TYPES = ["note", "bookmark", "recipe", "workout"] as const;

type ClientLibrarySource = "platform" | "coach" | "personal";

type ClientLibraryItem = {
  id: string;
  coach_id: string | null;
  type: string;
  title: string;
  content: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  source: ClientLibrarySource;
  is_platform?: boolean;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

  const { data: client } = await supabase
    .from("clients")
    .select("id, coach_id")
    .eq("user_id", user.id)
    .single();
  if (!client) return apiError(404, "Client not found", "CLIENT_NOT_FOUND");

  const libraryQuery = supabase
    .from("library_items")
    .select("id, coach_id, is_platform, type, title, content, created_at, updated_at")
    .or(client.coach_id ? `is_platform.eq.true,coach_id.eq.${client.coach_id}` : "is_platform.eq.true")
    .order("updated_at", { ascending: false });

  const personalQuery = supabase
    .from("client_library_items")
    .select("id, client_id, type, title, content, created_at, updated_at")
    .eq("client_id", client.id)
    .order("updated_at", { ascending: false });

  const [{ data: libraryItems, error: libraryError }, { data: personalItems, error: personalError }] =
    await Promise.all([libraryQuery, personalQuery]);

  if (libraryError) return apiError(500, "Failed to fetch library items", "CLIENT_LIBRARY_FETCH_FAILED");
  if (personalError) return apiError(500, "Failed to fetch personal items", "CLIENT_LIBRARY_FETCH_FAILED");

  const shared: ClientLibraryItem[] = (libraryItems ?? []).map((item) => ({
    ...item,
    source: item.is_platform ? "platform" : "coach",
  }));

  const personal: ClientLibraryItem[] = (personalItems ?? []).map((item) => ({
    id: item.id,
    coach_id: null,
    type: item.type,
    title: item.title,
    content: item.content as Record<string, unknown> | null,
    created_at: item.created_at,
    updated_at: item.updated_at,
    source: "personal",
  }));

  const merged = [...personal, ...shared].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return NextResponse.json(merged);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError(401, "Unauthorized", "UNAUTHORIZED");

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!client) return apiError(404, "Client not found", "CLIENT_NOT_FOUND");

  const body = await req.json();
  const type = typeof body.type === "string" ? body.type : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = body.content && typeof body.content === "object" ? body.content : null;

  if (!type || !title) {
    return apiError(400, "type and title are required", "VALIDATION_ERROR");
  }

  if (!PERSONAL_TYPES.includes(type as (typeof PERSONAL_TYPES)[number])) {
    return apiError(400, "Invalid type", "VALIDATION_ERROR");
  }

  const { data, error } = await supabase
    .from("client_library_items")
    .insert({
      client_id: client.id,
      type,
      title,
      content,
    })
    .select("id, type, title, content, created_at, updated_at")
    .single();

  if (error) return apiError(500, "Failed to create personal item", "CLIENT_LIBRARY_CREATE_FAILED");

  return NextResponse.json(
    {
      id: data.id,
      coach_id: null,
      type: data.type,
      title: data.title,
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at,
      source: "personal" as const,
    },
    { status: 201 }
  );
}
