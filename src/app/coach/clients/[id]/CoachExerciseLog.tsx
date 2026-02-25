"use client";

import { useState, useCallback, useEffect } from "react";
import type { ExerciseLogEntry } from "@/types/activity";

interface CoachExerciseLogProps {
  clientId: string;
}

export function CoachExerciseLog({ clientId }: CoachExerciseLogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [entries, setEntries] = useState<ExerciseLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLog = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date, client_id: clientId });
      const res = await fetch(`/api/exercise-log?${params.toString()}`);
      if (!res.ok) return;
      const data = (await res.json()) as { entries?: ExerciseLogEntry[] };
      setEntries(data.entries ?? []);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchLog(selectedDate);
  }, [selectedDate, fetchLog]);

  return (
    <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h2 className="font-heading font-bold text-base">Workout Log</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-dim uppercase tracking-wider">Date</label>
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input text-sm py-1.5 px-3"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-text-dim text-sm">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-text-dim text-sm">No exercises logged for this date.</p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 py-3 border-b border-[var(--green-08)] last:border-0"
            >
              <div
                className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center ${
                  entry.completed
                    ? "bg-green border-green"
                    : "border-[var(--green-12)]"
                }`}
              >
                {entry.completed && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--dark)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{entry.exercise_name}</p>
                <p className="text-xs text-text-dim">
                  {[
                    entry.planned_sets != null || entry.planned_reps
                      ? `Planned: ${entry.planned_sets ?? "—"} × ${entry.planned_reps ?? "—"}`
                      : null,
                    entry.actual_sets != null || entry.actual_reps
                      ? `Actual: ${entry.actual_sets ?? "—"} × ${entry.actual_reps ?? "—"}`
                      : null,
                    entry.notes ?? null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              {entry.completed && (
                <span className="text-xs text-green font-medium">Done</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
