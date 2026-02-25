import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Sign in first to accept the invite" },
        { status: 401 }
      );
    }

    const { token, coachId } = (await request.json()) as {
      token: string;
      coachId: string;
    };
    if (!token || !coachId) {
      return NextResponse.json(
        { error: "Missing token or coachId" },
        { status: 400 }
      );
    }

    const { data: invite, error: inviteErr } = await supabase
      .from("invites")
      .select("id, client_email, accepted_at, expires_at")
      .eq("token", token)
      .eq("coach_id", coachId)
      .single();

    if (inviteErr || !invite) {
      return NextResponse.json({ error: "Invalid invite" }, { status: 400 });
    }

    if (invite.accepted_at) {
      return NextResponse.json({ error: "Invite already accepted" }, { status: 400 });
    }

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invite expired" }, { status: 400 });
    }

    if (invite.client_email.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "Email does not match invite" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const nameFromEmail = user.email?.split("@")[0] ?? null;

    if (existing) {
      const { error: updateErr } = await supabase
        .from("clients")
        .update({
          coach_id: coachId,
          ...(nameFromEmail ? { name: nameFromEmail } : {}),
        })
        .eq("user_id", user.id);
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase.from("clients").insert({
        user_id: user.id,
        coach_id: coachId,
        name: user.email?.split("@")[0] ?? null,
      });
      if (insertErr) throw insertErr;
    }

    const admin = createAdminClient();
    const { error: inviteUpdateErr } = await admin
      .from("invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id);
    if (inviteUpdateErr) throw inviteUpdateErr;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Invite accept error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to accept invite" },
      { status: 500 }
    );
  }
}
