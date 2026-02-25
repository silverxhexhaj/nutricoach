"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RemoveClientButtonProps {
  clientId: string;
  clientName: string;
}

export function RemoveClientButton({
  clientId,
  clientName,
}: RemoveClientButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRemove() {
    const displayName = clientName || "Unnamed client";
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
      const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to remove client");
      router.push("/coach/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove client");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleRemove}
        disabled={loading}
        className="text-sm text-text-dim hover:text-red-400 transition-colors disabled:opacity-50"
      >
        {loading ? "Removing…" : "Remove from roster"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
