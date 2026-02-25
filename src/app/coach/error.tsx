"use client";

export default function CoachError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-[900px] mx-auto py-12 px-6">
      <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
        <h2 className="font-heading font-bold text-xl mb-2">Unable to load coach page</h2>
        <p className="text-text-dim text-sm mb-4">
          There was an error loading this section. You can retry now.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-lg bg-green px-4 py-2 text-sm font-semibold text-dark hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
        {error.message && <p className="mt-4 text-xs text-text-dim">Error: {error.message}</p>}
      </div>
    </div>
  );
}
