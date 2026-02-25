import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

/**
 * Page users land on after completing Supabase invite flow (set password).
 * Creates client record from pending invite and redirects to /app.
 */
export default async function InviteCompletePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/invite/complete");

  const email = user.email?.toLowerCase().trim();
  if (!email) redirect("/app");

  const { data: invite } = await supabase
    .from("invites")
    .select("id, coach_id")
    .eq("client_email", email)
    .is("accepted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!invite) redirect("/app");

  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const nameFromEmail = user.email?.split("@")[0] ?? null;

  if (!existing) {
    await supabase.from("clients").insert({
      user_id: user.id,
      coach_id: invite.coach_id,
      name: nameFromEmail,
    });
  } else {
    await supabase
      .from("clients")
      .update({
        coach_id: invite.coach_id,
        ...(nameFromEmail ? { name: nameFromEmail } : {}),
      })
      .eq("user_id", user.id);
  }

  const admin = createAdminClient();
  const { error: inviteUpdateErr } = await admin
    .from("invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  if (inviteUpdateErr) {
    throw inviteUpdateErr;
  }

  redirect("/app");
}
