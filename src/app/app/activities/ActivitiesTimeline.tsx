"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { GeneratedPlan } from "@/types/plan";
import type {
  SupplementLogEntry,
  ExerciseLogEntry,
  PlannedSupplement,
  PlannedExercise,
} from "@/types/activity";
import { DailyFoodLog } from "@/components/food-tracking/DailyFoodLog";

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SLOT_LABELS: Record<string, string> = {
  morning: "Morning",
  pre_workout: "Pre-Workout",
  post_workout: "Post-Workout",
  evening: "Evening",
  training_day: "Training Day",
  rest_day: "Rest Day",
};

function getDayNameForDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return DAY_NAMES[(d.getDay() + 6) % 7];
}

type ActivityTab = "meals" | "supplements" | "exercises";

interface ActivitiesTimelineProps {
  activePlan: GeneratedPlan | null;
  initialDate: string;
  initialSupplementLogs: SupplementLogEntry[];
  initialExerciseLogs: ExerciseLogEntry[];
}

export function ActivitiesTimeline({
  activePlan,
  initialDate,
  initialSupplementLogs,
  initialExerciseLogs,
}: ActivitiesTimelineProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [activeTab, setActiveTab] = useState<ActivityTab>("meals");
  const [supplementLogs, setSupplementLogs] = useState<SupplementLogEntry[]>(
    initialSupplementLogs
  );
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogEntry[]>(
    initialExerciseLogs
  );

  const dayName = getDayNameForDate(selectedDate);
  const today = new Date().toISOString().slice(0, 10);

  const fetchSupplementLogs = useCallback(async (date: string) => {
    const res = await fetch(`/api/supplement-log?date=${date}`);
    if (!res.ok) return;
    const data = (await res.json()) as { entries: SupplementLogEntry[] };
    setSupplementLogs(data.entries ?? []);
  }, []);

  const fetchExerciseLogs = useCallback(async (date: string) => {
    const res = await fetch(`/api/exercise-log?date=${date}`);
    if (!res.ok) return;
    const data = (await res.json()) as { entries: ExerciseLogEntry[] };
    setExerciseLogs(data.entries ?? []);
  }, []);

  useEffect(() => {
    if (selectedDate !== initialDate) {
      fetchSupplementLogs(selectedDate);
      fetchExerciseLogs(selectedDate);
    }
  }, [selectedDate, initialDate, fetchSupplementLogs, fetchExerciseLogs]);

  const plannedSupplements = ((): PlannedSupplement[] => {
    if (!activePlan?.supplement_schedule) return [];
    const supps = activePlan.supplement_schedule as Record<string, unknown[]>;
    const isTimeOfDay = "morning" in supps || "pre_workout" in supps;
    const weekly = activePlan.weekly_plan ?? [];
    const dayPlan = weekly.find(
      (d) => d.day?.toLowerCase() === dayName.toLowerCase()
    );
    const isTrainingDay =
      dayPlan?.is_training_day !== false && dayPlan?.type !== "Rest";

    if (isTimeOfDay) {
      const slots = ["morning", "pre_workout", "post_workout", "evening"];
      const out: PlannedSupplement[] = [];
      for (const slot of slots) {
        const items = (supps[slot] ?? []) as { name?: string; dose?: string }[];
        for (const item of items) {
          if (item?.name)
            out.push({
              type: "supplement",
              time_slot: slot,
              name: item.name,
              dose: item.dose ?? "",
            });
        }
      }
      return out;
    }
    const key = isTrainingDay ? "training_day" : "rest_day";
    const items = (supps[key] ?? []) as { name?: string; dose?: string }[];
    return items
      .filter((i) => i?.name)
      .map((i) => ({
        type: "supplement" as const,
        time_slot: key,
        name: i!.name!,
        dose: i!.dose ?? "",
      }));
  })();

  const plannedExercises = ((): PlannedExercise[] => {
    if (!activePlan?.workout_plan) return [];
    const wo = activePlan.workout_plan as Array<{
      day?: string;
      exercises?: Array<{ name: string; sets: number; reps: string; notes?: string }>;
    }>;
    const dayWorkout = wo.find(
      (w) => w.day?.toLowerCase() === dayName.toLowerCase()
    );
    const exercises = dayWorkout?.exercises ?? [];
    return exercises.map((ex) => ({
      type: "exercise" as const,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      notes: ex.notes,
    }));
  })();

  const plannedMeals =
    activePlan?.weekly_plan?.find(
      (d) => d.day?.toLowerCase() === dayName.toLowerCase()
    )?.meals ?? [];

  const getSupplementLog = (name: string, timeSlot: string) =>
    supplementLogs.find(
      (l) => l.supplement_name === name && l.time_slot === timeSlot
    );

  const getExerciseLog = (name: string) =>
    exerciseLogs.find((l) => l.exercise_name === name);

  async function toggleSupplement(
    name: string,
    dose: string,
    timeSlot: string,
    currentTaken: boolean
  ) {
    const res = await fetch("/api/supplement-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selectedDate,
        supplement_name: name,
        dose: dose || undefined,
        time_slot: timeSlot,
        taken: !currentTaken,
      }),
    });
    if (res.ok) {
      await fetchSupplementLogs(selectedDate);
      router.refresh();
    }
  }

  async function toggleExercise(
    name: string,
    plannedSets: number,
    plannedReps: string,
    currentCompleted: boolean
  ) {
    const res = await fetch("/api/exercise-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selectedDate,
        exercise_name: name,
        planned_sets: plannedSets,
        planned_reps: plannedReps,
        completed: !currentCompleted,
      }),
    });
    if (res.ok) {
      await fetchExerciseLogs(selectedDate);
      router.refresh();
    }
  }

  if (!activePlan) {
    return (
      <div className="bg-card border border-[var(--green-08)] rounded-xl p-8 text-center">
        <h2 className="font-heading font-bold text-xl mb-2">
          No plan yet
        </h2>
        <p className="text-text-dim mb-6">
          Complete your plan to see your daily activities timeline. Your coach
          will suggest meals, supplements, and exercises.
        </p>
        <a
          href="/app"
          className="inline-block btn-form-next py-2.5 px-6"
        >
          Go to My Plan
        </a>
      </div>
    );
  }

  const calorieTarget =
    activePlan.user_stats?.calorie_target ??
    activePlan.calorie_target ??
    undefined;
  const proteinTarget =
    activePlan.user_stats?.protein_target_g ??
    activePlan.protein_target ??
    undefined;

  const TABS: { id: ActivityTab; label: string }[] = [
    { id: "meals", label: "Meals" },
    { id: "supplements", label: "Supplements" },
    { id: "exercises", label: "Exercises" },
  ];

  return (
    <div>
      <h1 className="font-heading font-extrabold text-2xl mb-2">
        Activities
      </h1>
      <p className="text-text-dim text-sm mb-6">
        Your daily timeline — suggested by your coach. Track and adjust as you
        go.
      </p>

      <div className="mb-6">
        <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
          Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="form-input w-auto max-w-[200px]"
        />
      </div>

      <div className="plan-tabs mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`plan-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === "meals" && (
          <div className="space-y-8">
            {plannedMeals.length > 0 && (
              <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
                <h3 className="font-heading font-bold text-green mb-4">
                  Suggested by coach — {dayName}
                </h3>
                <div className="space-y-4">
                  {plannedMeals.map((m, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-1 pb-4 border-b border-[var(--green-08)] last:border-0 last:pb-0"
                    >
                      {m.type && (
                        <span className="text-[0.62rem] text-text-dim uppercase tracking-wider font-semibold">
                          {m.time && `${m.time} · `}
                          {m.type}
                        </span>
                      )}
                      <span className="text-sm font-medium leading-snug">
                        {m.name}
                      </span>
                      {(m.ingredients?.length ?? 0) > 0 && (
                        <span className="text-xs text-text-dim">
                          {m.ingredients?.join(", ")}
                        </span>
                      )}
                      <span className="text-[0.68rem] text-green">
                        {m.kcal} kcal · {m.protein_g}g protein
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="font-heading font-bold text-green mb-4">
                Your food log
              </h3>
              <DailyFoodLog
                date={selectedDate}
                calorieTarget={calorieTarget}
                proteinTarget={proteinTarget}
              />
            </div>
          </div>
        )}

        {activeTab === "supplements" && (
          <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
            {plannedSupplements.length === 0 ? (
              <p className="text-text-dim text-sm">
                No supplements scheduled for {dayName}.
              </p>
            ) : (
              <div className="space-y-4">
                {plannedSupplements.map((s, i) => {
                  const log = getSupplementLog(s.name, s.time_slot);
                  const taken = log?.taken ?? false;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 py-3 border-b border-[var(--green-08)] last:border-0"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleSupplement(s.name, s.dose, s.time_slot, taken)
                        }
                        className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          taken
                            ? "bg-green border-green"
                            : "border-[var(--green-12)] hover:border-green"
                        }`}
                        aria-label={taken ? "Mark not taken" : "Mark taken"}
                      >
                        {taken && (
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
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-text-dim">
                          {SLOT_LABELS[s.time_slot] ?? s.time_slot}
                          {s.dose && ` · ${s.dose}`}
                        </p>
                      </div>
                      {taken && (
                        <span className="text-xs text-green font-medium">
                          Taken
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "exercises" && (
          <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
            {plannedExercises.length === 0 ? (
              <p className="text-text-dim text-sm">
                No workout scheduled for {dayName}.
              </p>
            ) : (
              <div className="space-y-4">
                {plannedExercises.map((ex, i) => {
                  const log = getExerciseLog(ex.name);
                  const completed = log?.completed ?? false;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 py-3 border-b border-[var(--green-08)] last:border-0"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleExercise(
                            ex.name,
                            ex.sets,
                            ex.reps,
                            completed
                          )
                        }
                        className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          completed
                            ? "bg-green border-green"
                            : "border-[var(--green-12)] hover:border-green"
                        }`}
                        aria-label={
                          completed ? "Mark not completed" : "Mark completed"
                        }
                      >
                        {completed && (
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
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{ex.name}</p>
                        <p className="text-xs text-text-dim">
                          {ex.sets} × {ex.reps}
                          {ex.notes && ` · ${ex.notes}`}
                        </p>
                      </div>
                      {completed && (
                        <span className="text-xs text-green font-medium">
                          Done
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
