import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
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

    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!coach) {
      return NextResponse.json({ error: "Coach profile not found" }, {
        status: 403,
      });
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .eq("coach_id", coach.id)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: "Client not found or access denied" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("clients")
      .update({ coach_id: null, updated_at: new Date().toISOString() })
      .eq("id", clientId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Remove client error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to remove client",
      },
      { status: 500 }
    );
  }
}
