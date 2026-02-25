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

    const { id: inviteId } = await params;

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

    const { data: invite } = await supabase
      .from("invites")
      .select("id")
      .eq("id", inviteId)
      .eq("coach_id", coach.id)
      .single();

    if (!invite) {
      return NextResponse.json(
        { error: "Invite not found or access denied" },
        { status: 404 }
      );
    }

    const { error } = await supabase.from("invites").delete().eq("id", inviteId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Revoke invite error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to revoke invite",
      },
      { status: 500 }
    );
  }
}
