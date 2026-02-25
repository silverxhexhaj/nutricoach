import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { data: item } = await supabase
    .from("client_library_items")
    .select("id, client_id")
    .eq("id", id)
    .single();

  if (!item) return apiError(404, "Personal library item not found", "CLIENT_LIBRARY_NOT_FOUND");
  if (item.client_id !== client.id) return apiError(403, "Forbidden", "FORBIDDEN");

  const { error } = await supabase.from("client_library_items").delete().eq("id", id);
  if (error) return apiError(500, "Failed to delete personal item", "CLIENT_LIBRARY_DELETE_FAILED");

  return NextResponse.json({ success: true });
}
