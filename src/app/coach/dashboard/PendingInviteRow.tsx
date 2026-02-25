"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PendingInviteRowProps {
  invite: {
    id: string;
    client_email: string;
    created_at: string;
    token: string;
  };
  baseUrl: string;
}

export function PendingInviteRow({ invite, baseUrl }: PendingInviteRowProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const inviteUrl = `${baseUrl}/invite/accept?token=${invite.token}`;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy");
    }
  }

  async function handleRevoke() {
    if (!confirm(`Cancel this invite for ${invite.client_email}?`)) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/invites/${invite.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to revoke invite");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke invite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="flex items-center justify-between py-2 border-b border-[var(--green-08)] gap-4">
      <div className="flex-1 min-w-0">
        <span className="text-text-dim">{invite.client_email}</span>
        <span className="text-xs text-text-dim ml-2">
          {new Date(invite.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "UTC",
          })}
        </span>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="text-sm text-text-dim hover:text-green transition-colors"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={handleRevoke}
            disabled={loading}
            className="text-sm text-text-dim hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {loading ? "Revoking…" : "Revoke"}
          </button>
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </li>
  );
}
