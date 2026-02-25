"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AddClientFormProps {
  coachId: string;
}

export function AddClientForm({ coachId }: AddClientFormProps) {
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [lastInvitedEmail, setLastInvitedEmail] = useState<string>("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInviteLink(null);
    setEmailSent(false);
    setEmailError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/invites/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachId, clientEmail: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create invite");
      setInviteLink(data.inviteUrl);
      setEmailSent(data.emailSent ?? false);
      setEmailError(data.emailError ?? null);
      setLastInvitedEmail(email.trim());
      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-card border border-[var(--green-08)] rounded-xl p-6">
      <h3 className="font-heading font-semibold text-base mb-1">
        Invite new client
      </h3>
      <p className="text-text-dim text-sm mb-4">
        Enter their email to send an invite link.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input flex-1 min-w-[200px]"
          placeholder="client@example.com"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-form-next py-3 px-6"
        >
          {loading ? "Sending…" : "Send invite"}
        </button>
      </form>
      {error && <div className="error-box mt-4">{error}</div>}
      {inviteLink && (
        <div className="mt-4 p-4 bg-[rgba(184,240,74,0.08)] rounded-lg border border-[var(--green-08)]">
          {emailSent ? (
            <p className="text-sm text-green mb-2">
              Invite email sent to {lastInvitedEmail}!
            </p>
          ) : emailError ? (
            <p className="text-sm text-amber-400 mb-2">
              Email could not be sent ({emailError}). Share the link manually:
            </p>
          ) : (
            <p className="text-xs text-text-dim mb-2">
              Share this link with your client (copy and send via WhatsApp, etc.):
            </p>
          )}
          <code className="text-sm text-green break-all">{inviteLink}</code>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(inviteLink)}
            className="block mt-2 text-xs text-green hover:underline"
          >
            Copy link
          </button>
        </div>
      )}
    </section>
  );
}
