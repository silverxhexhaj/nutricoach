"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface InviteAcceptFormProps {
  token: string;
  clientEmail: string;
  coachId: string;
  isLoggedInAsInvitee: boolean;
  currentUserEmail: string | null;
}

export function InviteAcceptForm({
  token,
  clientEmail,
  coachId,
  isLoggedInAsInvitee,
  currentUserEmail,
}: InviteAcceptFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const inviteUrl = `/invite/accept?token=${token}`;
  const loginRedirect = `/login?redirect=${encodeURIComponent(inviteUrl)}`;

  async function handleAcceptInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, coachId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to accept invite");

      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invite");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpErr } = await supabase.auth.signUp({
        email: clientEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(inviteUrl)}`,
        },
      });
      if (signUpErr) throw signUpErr;

      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, coachId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to accept invite");

      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <h1 className="font-heading font-extrabold text-2xl mb-2">
        Accept invite
      </h1>

      {isLoggedInAsInvitee ? (
        <>
          <p className="text-text-dim text-sm mb-6">
            You&apos;re logged in as {clientEmail}. Accept the invite to join your coach&apos;s platform.
          </p>
          <form onSubmit={handleAcceptInvite} className="space-y-4">
            {error && <div className="error-box">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="btn-form-next w-full py-3"
            >
              {loading ? "Accepting…" : "Accept invite"}
            </button>
          </form>
        </>
      ) : currentUserEmail ? (
        <div className="space-y-4">
          <p className="text-text-dim text-sm">
            You&apos;re logged in as <strong>{currentUserEmail}</strong>, but this invite is for <strong>{clientEmail}</strong>.
          </p>
          <p className="text-text-dim text-sm">
            Please{" "}
            <form
              action={`/auth/signout?redirect=${encodeURIComponent(inviteUrl)}`}
              method="post"
              className="inline"
            >
              <button
                type="submit"
                className="text-green hover:underline bg-transparent border-none p-0 cursor-pointer font-inherit"
              >
                log out
              </button>
            </form>{" "}
            and then either log in with {clientEmail} or create a new account for that email.
          </p>
        </div>
      ) : (
        <>
          <p className="text-text-dim text-sm mb-6">
            Create your account to join your coach&apos;s platform.
          </p>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={clientEmail}
                readOnly
                className="form-input w-full bg-[rgba(255,255,255,0.02)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input w-full"
                minLength={6}
                required
              />
            </div>
            {error && <div className="error-box">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="btn-form-next w-full py-3"
            >
              {loading ? "Creating account…" : "Create account & join"}
            </button>
          </form>
          <p className="text-text-dim text-sm mt-6 text-center">
            Already have an account?{" "}
            <Link href={loginRedirect} className="text-green hover:underline">
              Log in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
