"use client";

import { useState } from "react";

interface CheckinRow {
  date: string;
  weight_kg: number | null;
  water_ml: number | null;
  calories: number | null;
  protein_g: number | null;
  workout_done: boolean | null;
  energy_level: number | null;
  notes: string | null;
}

interface CoachClientProgressProps {
  checkins: CheckinRow[];
  calorieTarget: number | null;
  proteinTarget: number | null;
  assignedProgram?: { name: string; startDate: string } | null;
  programCompletion?: {
    daysCompleted: number;
    totalDays: number;
    itemsCompleted: number;
    totalWorkoutMealItems: number;
  } | null;
}

function computeStreak(checkins: CheckinRow[]): number {
  if (checkins.length === 0) return 0;
  const sorted = [...checkins].sort((a, b) => b.date.localeCompare(a.date));
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let expected = today;
  for (const c of sorted) {
    if (c.date !== expected) break;
    streak++;
    const d = new Date(expected);
    d.setDate(d.getDate() - 1);
    expected = d.toISOString().slice(0, 10);
  }
  return streak;
}

export function CoachClientProgress({
  checkins,
  calorieTarget,
  proteinTarget,
  assignedProgram,
  programCompletion,
}: CoachClientProgressProps) {
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const withWeight = checkins.filter((c) => c.weight_kg != null) as (CheckinRow & {
    weight_kg: number;
  })[];
  const sortedByDate = [...withWeight].sort((a, b) => a.date.localeCompare(b.date));
  const minWeight = sortedByDate.length
    ? Math.min(...sortedByDate.map((c) => c.weight_kg))
    : 0;
  const maxWeight = sortedByDate.length
    ? Math.max(...sortedByDate.map((c) => c.weight_kg))
    : 100;
  const range = maxWeight - minWeight || 1;
  const streak = computeStreak(checkins);
  const totalCheckins = checkins.length;
  const workoutCount = checkins.filter((c) => c.workout_done).length;

  const recentWithMacros = checkins.filter(
    (c) => c.calories != null || c.protein_g != null
  );
  const avgCalories =
    recentWithMacros.length > 0
      ? Math.round(
          recentWithMacros.reduce((s, c) => s + (c.calories ?? 0), 0) /
            recentWithMacros.length
        )
      : null;
  const avgProtein =
    recentWithMacros.length > 0
      ? Math.round(
          recentWithMacros.reduce((s, c) => s + (c.protein_g ?? 0), 0) /
            recentWithMacros.length
        )
      : null;

  return (
    <div className="space-y-8">
      {assignedProgram && (
        <div className="bg-[var(--green-08)] border border-[var(--green-10)] rounded-lg px-4 py-3">
          <p className="text-sm text-text-dim">
            <span className="font-medium text-green">Check-ins from plan</span>
            {" · "}
            Program: <span className="text-white">{assignedProgram.name}</span>
            {" "}
            (started {new Date(assignedProgram.startDate).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })})
          </p>
        </div>
      )}
      {assignedProgram && programCompletion && programCompletion.totalDays > 0 && (
        <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
          <h3 className="font-heading font-bold text-lg mb-4">Program completion</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[var(--green-08)] rounded-lg p-4">
              <p className="text-xs font-medium text-text-dim uppercase tracking-wider">
                Days completed
              </p>
              <p className="font-heading font-extrabold text-2xl text-green mt-1">
                {programCompletion.daysCompleted} / {programCompletion.totalDays}
              </p>
            </div>
            {programCompletion.totalWorkoutMealItems > 0 && (
              <div className="bg-[var(--green-08)] rounded-lg p-4">
                <p className="text-xs font-medium text-text-dim uppercase tracking-wider">
                  Workouts & meals
                </p>
                <p className="font-heading font-extrabold text-2xl text-green mt-1">
                  {programCompletion.itemsCompleted} / {programCompletion.totalWorkoutMealItems}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
        <h3 className="font-heading font-bold text-lg mb-4">Progress Overview</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--green-08)] rounded-lg p-4">
            <p className="text-xs font-medium text-text-dim uppercase tracking-wider">
              Check-in streak
            </p>
            <p className="font-heading font-extrabold text-2xl text-green mt-1">
              {streak} {streak === 1 ? "day" : "days"}
            </p>
          </div>
          <div className="bg-[var(--green-08)] rounded-lg p-4">
            <p className="text-xs font-medium text-text-dim uppercase tracking-wider">
              Total check-ins
            </p>
            <p className="font-heading font-extrabold text-2xl text-green mt-1">
              {totalCheckins}
            </p>
          </div>
          <div className="bg-[var(--green-08)] rounded-lg p-4">
            <p className="text-xs font-medium text-text-dim uppercase tracking-wider">
              Workouts logged
            </p>
            <p className="font-heading font-extrabold text-2xl text-green mt-1">
              {workoutCount}
            </p>
          </div>
          {calorieTarget != null && avgCalories != null && (
            <div className="bg-[var(--green-08)] rounded-lg p-4">
              <p className="text-xs font-medium text-text-dim uppercase tracking-wider">
                Avg calories vs target
              </p>
              <p className="font-heading font-extrabold text-2xl text-green mt-1">
                {avgCalories} / {calorieTarget}
              </p>
            </div>
          )}
          {proteinTarget != null && avgProtein != null && (
            <div className="bg-[var(--green-08)] rounded-lg p-4">
              <p className="text-xs font-medium text-text-dim uppercase tracking-wider">
                Avg protein vs target
              </p>
              <p className="font-heading font-extrabold text-2xl text-green mt-1">
                {avgProtein}g / {proteinTarget}g
              </p>
            </div>
          )}
        </div>

        {sortedByDate.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-text-dim uppercase tracking-wider mb-3">
              Weight trend
            </p>
            <div className="flex items-end gap-1 h-24">
              {sortedByDate.slice(-14).map((c) => {
                const height =
                  ((c.weight_kg - minWeight) / range) * 60 + 20;
                return (
                  <div
                    key={c.date}
                    className="flex-1 min-w-[20px] flex flex-col items-center gap-1"
                    title={`${c.date}: ${c.weight_kg}kg`}
                  >
                    <div
                      className="w-full bg-green rounded-t transition-all"
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-[10px] text-text-dim truncate max-w-full">
                      {new Date(c.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
            {sortedByDate.length >= 2 && (() => {
              const first = sortedByDate[0].weight_kg;
              const last = sortedByDate[sortedByDate.length - 1].weight_kg;
              if (first == null || last == null) return null;
              const diff = last - first;
              return (
                <p className="text-xs text-text-dim mt-2">
                  {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg since start
                </p>
              );
            })()}
          </div>
        ) : (
          <p className="text-text-dim text-sm">
            No check-ins yet. Client needs to complete their first daily check-in.
          </p>
        )}
      </div>

      {checkins.length > 0 && (
        <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
          <h3 className="font-heading font-bold text-lg mb-4">Recent check-ins</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-dim border-b border-[var(--green-08)]">
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Weight</th>
                  <th className="pb-2 pr-4">Calories</th>
                  <th className="pb-2 pr-4">Protein</th>
                  <th className="pb-2 pr-4">Workout</th>
                  <th className="pb-2 pr-4">Energy</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {checkins.slice(0, 14).map((c) => (
                  <tr
                    key={c.date}
                    className="border-b border-[var(--green-08)] last:border-0"
                  >
                    <td className="py-2 pr-4">
                      {new Date(c.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2 pr-4">
                      {c.weight_kg != null ? `${c.weight_kg} kg` : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {c.calories != null ? c.calories : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {c.protein_g != null ? `${c.protein_g}g` : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {c.workout_done === true ? "Yes" : c.workout_done === false ? "No" : "—"}
                    </td>
                    <td className="py-2">
                      {c.energy_level != null ? `${c.energy_level}/5` : "—"}
                    </td>
                    <td className="py-2">
                      {c.notes ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedNotes((prev) => ({
                              ...prev,
                              [c.date]: !prev[c.date],
                            }))
                          }
                          className="text-left text-text-dim hover:text-green transition-colors"
                        >
                          {expandedNotes[c.date] || c.notes.length <= 50
                            ? c.notes
                            : `${c.notes.slice(0, 50)}...`}
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
