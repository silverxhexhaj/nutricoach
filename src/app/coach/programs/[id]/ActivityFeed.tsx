"use client";

import { useEffect, useState, useCallback } from "react";
import type { ActivityFeedEntry } from "@/types/program";

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

const TYPE_EMOJI: Record<string, string> = {
  workout: "⚡",
  exercise: "⚡",
  meal: "🥗",
  video: "▶",
  text: "≡",
};

interface ActivityFeedProps {
  programId: string;
  clientProgramId?: string;
}

export function ActivityFeed({ programId, clientProgramId }: ActivityFeedProps) {
  const [feed, setFeed] = useState<ActivityFeedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    try {
      const url = new URL(`/api/programs/${programId}/activity-feed`, window.location.origin);
      if (clientProgramId) url.searchParams.set("clientProgramId", clientProgramId);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setFeed(data.feed ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [programId, clientProgramId]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <p className="text-sm text-text-dim py-4 text-center">
        No activity yet. Completions will appear here as your client progresses.
      </p>
    );
  }

  return (
    <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
      {feed.map((entry) => (
        <div
          key={entry.id}
          className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-dark border border-[var(--green-08)] hover:border-[var(--green-20)] transition-colors"
        >
          <div className="shrink-0 mt-0.5">
            {entry.type === "day_completed" ? (
              <div className="w-6 h-6 rounded-full bg-green/20 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-[var(--green-08)] flex items-center justify-center text-xs">
                {TYPE_EMOJI[entry.itemType ?? "text"] ?? "✓"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium text-green">{entry.clientName}</span>{" "}
              {entry.type === "day_completed" ? (
                <span className="text-text-dim">
                  completed <span className="text-white">Day {entry.dayNumber}</span>
                </span>
              ) : (
                <span className="text-text-dim">
                  completed{" "}
                  <span className="text-white">{entry.itemTitle ?? "an item"}</span>
                </span>
              )}
            </p>
            <p className="text-xs text-text-dim mt-0.5">
              {relativeTime(entry.completedAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
