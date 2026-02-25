import Link from "next/link";

export interface RecentCheckinItem {
  clientId: string;
  clientName: string;
  date: string;
  weightKg: number | null;
  calories: number | null;
  proteinG: number | null;
  waterMl: number | null;
  workoutDone: boolean | null;
  energyLevel: number | null;
  notes: string | null;
}

interface RecentCheckinsProps {
  checkins: RecentCheckinItem[];
}

export function RecentCheckins({ checkins }: RecentCheckinsProps) {
  if (checkins.length === 0) {
    return (
      <p className="text-text-dim text-sm mb-4">
        No recent check-ins. Clients will appear here once they log their daily
        check-in.
      </p>
    );
  }

  return (
    <ul className="space-y-0">
      {checkins.map((c) => (
        <li
          key={`${c.clientId}-${c.date}`}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-[var(--green-08)] gap-2"
        >
          <div className="flex-1 min-w-0">
            <Link
              href={`/coach/clients/${c.clientId}`}
              className="font-medium text-green hover:underline"
            >
              {c.clientName}
            </Link>
            <p className="text-text-dim text-xs mt-0.5">
              {new Date(c.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-dim">
            {c.weightKg != null && (
              <span>
                {c.weightKg} kg
              </span>
            )}
            {c.calories != null && (
              <span>
                {c.calories} kcal
              </span>
            )}
            {c.proteinG != null && (
              <span>
                {c.proteinG}g protein
              </span>
            )}
            {c.waterMl != null && (
              <span>{c.waterMl}ml water</span>
            )}
            {c.workoutDone != null && (
              <span className={c.workoutDone ? "text-green" : "text-text-dim"}>
                {c.workoutDone ? "Workout" : "Rest"}
              </span>
            )}
            {c.energyLevel != null && (
              <span>Energy {c.energyLevel}/5</span>
            )}
            {c.notes && (
              <span className="max-w-[220px] truncate">Notes: {c.notes}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
