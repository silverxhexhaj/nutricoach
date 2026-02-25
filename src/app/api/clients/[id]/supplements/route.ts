import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: clientId } = await params;
    const body = await request.json();
    const {
      herbalife_products = [],
      other_supplements = [],
    } = body as {
      herbalife_products?: string[];
      other_supplements?: string[];
    };

    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!coach) {
      return NextResponse.json({ error: "Coach profile not found" }, { status: 403 });
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id, user_id")
      .eq("id", clientId)
      .eq("coach_id", coach.id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client not found or access denied" }, { status: 404 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        herbalife_products: Array.isArray(herbalife_products) ? herbalife_products : [],
        other_supplements: Array.isArray(other_supplements) ? other_supplements : [],
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", client.user_id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Supplements update error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update supplements" },
      { status: 500 }
    );
  }
}
