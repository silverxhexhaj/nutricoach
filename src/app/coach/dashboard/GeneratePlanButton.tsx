"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GeneratePlanButtonProps {
  clientId: string;
  clientName: string;
  onboardingComplete: boolean;
}

export function GeneratePlanButton({
  clientId,
  clientName,
  onboardingComplete,
}: GeneratePlanButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, name: clientName || "Client" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Plan generation failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }

  if (!onboardingComplete) {
    return (
      <span className="text-xs text-text-dim">Complete onboarding first</span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="text-sm text-green hover:underline disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate plan"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
