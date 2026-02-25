"use client";

interface CheckinRow {
  date: string;
  weight_kg: number | null;
  water_ml: number | null;
  calories: number | null;
  protein_g: number | null;
  workout_done: boolean | null;
  energy_level: number | null;
}

interface ProgressDashboardProps {
  checkins: CheckinRow[];
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

export function ProgressDashboard({ checkins }: ProgressDashboardProps) {
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

  return (
    <div className="bg-card border border-[var(--green-08)] rounded-xl p-6 mb-8">
      <h3 className="font-heading font-bold text-lg mb-4">Your Progress</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
          <p className="text-xs text-text-dim mt-2">
            {sortedByDate.length >= 2 && (() => {
              const first = sortedByDate[0].weight_kg;
              const last = sortedByDate[sortedByDate.length - 1].weight_kg;
              if (first == null || last == null) return null;
              const diff = last - first;
              return (
                <span>
                  {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg since start
                </span>
              );
            })()}
          </p>
        </div>
      ) : (
        <p className="text-text-dim text-sm">
          Complete a check-in with weight to see your progress chart.
        </p>
      )}
    </div>
  );
}
