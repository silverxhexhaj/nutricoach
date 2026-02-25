import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InviteAcceptForm } from "./InviteAcceptForm";

export default async function InviteAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect("/login?error=invalid_invite");
  }

  const supabase = await createClient();
  const [
    { data: invite, error: inviteErr },
    { data: { user } },
  ] = await Promise.all([
    supabase
      .from("invites")
      .select("id, coach_id, client_email, expires_at, accepted_at")
      .eq("token", token)
      .single(),
    supabase.auth.getUser(),
  ]);

  if (inviteErr || !invite) {
    redirect("/login?error=invalid_invite");
  }

  if (invite.accepted_at) {
    redirect("/app?message=already_accepted");
  }

  if (new Date(invite.expires_at) < new Date()) {
    redirect("/login?error=invite_expired");
  }

  const isLoggedInAsInvitee =
    user?.email?.toLowerCase() === invite.client_email.toLowerCase();

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-6">
      <a
        href="/"
        className="font-heading font-extrabold text-xl text-green mb-8"
      >
        NutriCoach <span className="text-text">AI</span>
      </a>
      <InviteAcceptForm
        token={token}
        clientEmail={invite.client_email}
        coachId={invite.coach_id}
        isLoggedInAsInvitee={!!isLoggedInAsInvitee}
        currentUserEmail={user?.email ?? null}
      />
    </div>
  );
}
