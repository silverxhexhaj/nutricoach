"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface InviteClientButtonProps {
  coachId: string;
}

export function InviteClientButton({ coachId }: InviteClientButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [lastInvitedEmail, setLastInvitedEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

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

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-form-next py-3 px-6"
      >
        Invite client
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Invite client"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <div
            className="bg-card border border-[var(--green-08)] rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Invite new client</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="p-2 -mr-2 text-text-dim hover:text-green transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-text-dim text-sm mb-4">
              Enter their email to send an invite link.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input w-full"
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
                    Email could not be sent ({emailError}). Share the link
                    manually:
                  </p>
                ) : (
                  <p className="text-xs text-text-dim mb-2">
                    Share this link with your client (copy and send via
                    WhatsApp, etc.):
                  </p>
                )}
                <code className="text-sm text-green break-all block">
                  {inviteLink}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(inviteLink)}
                  className="mt-2 text-xs text-green hover:underline"
                >
                  Copy link
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
