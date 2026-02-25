"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GeneratePlanButton } from "./GeneratePlanButton";

interface ClientRowProps {
  client: {
    id: string;
    name: string | null;
    onboarding_complete: boolean | null;
    current_plan_id: string | null;
  };
  todayCheckin: boolean;
  lastCheckinDate: string | null;
}

export function ClientRow({
  client,
  todayCheckin,
  lastCheckinDate,
}: ClientRowProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRemove() {
    const displayName = client.name || "Unnamed client";
    if (
      !confirm(
        `Remove ${displayName} from your roster? They will no longer appear in your client list.`
      )
    ) {
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to remove client");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove client");
    } finally {
      setLoading(false);
    }
  }

  const displayName = client.name || "Unnamed client";

  return (
    <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-[var(--green-08)] gap-3">
      <div className="flex-1 min-w-0">
        <Link
          href={`/coach/clients/${client.id}`}
          className="font-medium text-green hover:underline"
        >
          {displayName}
        </Link>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs">
          <span
            className={
              client.onboarding_complete ? "text-green" : "text-text-dim"
            }
          >
            {client.onboarding_complete ? "Onboarded" : "Pending"}
          </span>
          <span
            className={
              client.current_plan_id ? "text-green" : "text-text-dim"
            }
          >
            {client.current_plan_id ? "Plan active" : "No plan"}
          </span>
          <span className={todayCheckin ? "text-green" : "text-text-dim"}>
            {todayCheckin ? "Check-in today" : "No check-in today"}
          </span>
          {lastCheckinDate && (
            <span className="text-text-dim">
              Last seen:{" "}
              {new Date(lastCheckinDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/coach/clients/${client.id}`}
            className="text-sm text-green hover:underline transition-colors"
          >
            View progress
          </Link>
          <GeneratePlanButton
            clientId={client.id}
            clientName={client.name ?? "Client"}
            onboardingComplete={client.onboarding_complete ?? false}
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="text-sm text-text-dim hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {loading ? "Removing…" : "Remove"}
          </button>
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </li>
  );
}
