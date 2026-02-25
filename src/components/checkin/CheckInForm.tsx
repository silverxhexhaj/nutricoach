"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DailyFoodLog } from "@/components/food-tracking/DailyFoodLog";

interface CheckInFormProps {
  todayCheckin?: {
    weight_kg: number | null;
    water_ml: number | null;
    calories: number | null;
    protein_g: number | null;
    workout_done: boolean | null;
    energy_level: number | null;
    notes: string | null;
  } | null;
  /** When provided, form edits this date (for calendar backfill) */
  date?: string | null;
  /** Called after successful save (e.g. to refresh calendar) */
  onSaved?: () => void;
  /** Calorie target from the active plan (shown in food log progress bar) */
  calorieTarget?: number;
  /** Protein target from the active plan */
  proteinTarget?: number;
}

type TrackingMode = "food_log" | "quick_entry";

export function CheckInForm({
  todayCheckin,
  date,
  onSaved,
  calorieTarget,
  proteinTarget,
}: CheckInFormProps) {
  const router = useRouter();

  // Non-nutrition fields (unchanged)
  const [weight, setWeight] = useState(todayCheckin?.weight_kg?.toString() ?? "");
  const [water, setWater] = useState(todayCheckin?.water_ml?.toString() ?? "");
  const [workoutDone, setWorkoutDone] = useState(todayCheckin?.workout_done ?? false);
  const [energyLevel, setEnergyLevel] = useState(todayCheckin?.energy_level ?? 3);
  const [notes, setNotes] = useState(todayCheckin?.notes ?? "");

  // Quick-entry nutrition fields (fallback)
  const [calories, setCalories] = useState(todayCheckin?.calories?.toString() ?? "");
  const [protein, setProtein] = useState(todayCheckin?.protein_g?.toString() ?? "");

  // Food log computed totals (set by DailyFoodLog callbacks)
  const [logCalories, setLogCalories] = useState(0);
  const [logProtein, setLogProtein] = useState(0);

  // Toggle between precise food log and quick manual entry
  const [trackingMode, setTrackingMode] = useState<TrackingMode>("food_log");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const checkinDate = date ?? new Date().toISOString().slice(0, 10);
  const isHistorical = date != null && date !== new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (todayCheckin) {
      setWeight(todayCheckin.weight_kg?.toString() ?? "");
      setWater(todayCheckin.water_ml?.toString() ?? "");
      setCalories(todayCheckin.calories?.toString() ?? "");
      setProtein(todayCheckin.protein_g?.toString() ?? "");
      setWorkoutDone(todayCheckin.workout_done ?? false);
      setEnergyLevel(todayCheckin.energy_level ?? 3);
      setNotes(todayCheckin.notes ?? "");
    } else {
      setWeight("");
      setWater("");
      setCalories("");
      setProtein("");
      setWorkoutDone(false);
      setEnergyLevel(3);
      setNotes("");
    }
    setSaved(false);
    setError(null);
  }, [checkinDate, todayCheckin]);

  const handleFoodLogTotals = useCallback((cal: number, prot: number) => {
    setLogCalories(cal);
    setLogProtein(prot);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Use food log totals when in food_log mode (and entries exist), else use manual fields
    const finalCalories =
      trackingMode === "food_log" && logCalories > 0
        ? Math.round(logCalories)
        : calories
        ? parseInt(calories, 10)
        : undefined;

    const finalProtein =
      trackingMode === "food_log" && logProtein > 0
        ? Math.round(logProtein)
        : protein
        ? parseInt(protein, 10)
        : undefined;

    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: checkinDate,
          weight_kg: weight ? parseFloat(weight) : undefined,
          water_ml: water ? parseInt(water, 10) : undefined,
          calories: finalCalories,
          protein_g: finalProtein,
          workout_done: workoutDone,
          energy_level: energyLevel,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setSaved(true);
      router.refresh();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save check-in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-[var(--green-08)] rounded-xl p-6 mb-8"
    >
      <h3 className="font-heading font-bold text-lg mb-4">
        {isHistorical
          ? `Check-In — ${new Date(checkinDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}`
          : "Today's Check-In"}
      </h3>

      {/* Body stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="form-input w-full"
            placeholder="e.g. 75"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
            Water (ml)
          </label>
          <input
            type="number"
            min="0"
            value={water}
            onChange={(e) => setWater(e.target.value)}
            className="form-input w-full"
            placeholder="e.g. 2000"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
            Workout done
          </label>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={workoutDone}
              onChange={(e) => setWorkoutDone(e.target.checked)}
              className="rounded border-[var(--green-08)] bg-dark text-green focus:ring-green"
            />
            <span className="text-sm">Yes</span>
          </label>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
            Energy level (1–5)
          </label>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setEnergyLevel(n)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  energyLevel === n
                    ? "bg-green text-dark"
                    : "bg-[var(--green-08)] text-text-dim hover:bg-[var(--green-12)]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nutrition tracking section */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs font-medium text-text-dim uppercase tracking-wider">
            Nutrition Tracking
          </label>
          <div className="flex rounded-lg overflow-hidden border border-[var(--green-08)]">
            <button
              type="button"
              onClick={() => setTrackingMode("food_log")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                trackingMode === "food_log"
                  ? "bg-green text-dark"
                  : "text-text-dim hover:text-text"
              }`}
            >
              Food Log
            </button>
            <button
              type="button"
              onClick={() => setTrackingMode("quick_entry")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                trackingMode === "quick_entry"
                  ? "bg-green text-dark"
                  : "text-text-dim hover:text-text"
              }`}
            >
              Quick Entry
            </button>
          </div>
        </div>

        {trackingMode === "food_log" ? (
          <DailyFoodLog
            date={checkinDate}
            calorieTarget={calorieTarget}
            proteinTarget={proteinTarget}
            onTotalsChange={handleFoodLogTotals}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
                Calories
              </label>
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="form-input w-full"
                placeholder="e.g. 2200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
                Protein (g)
              </label>
              <input
                type="number"
                min="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="form-input w-full"
                placeholder="e.g. 150"
              />
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="mt-2">
        <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="form-input w-full min-h-[80px]"
          placeholder="How are you feeling? Any changes?"
          rows={3}
        />
      </div>

      {error && <div className="error-box mt-4">{error}</div>}
      {saved && (
        <p className="text-green text-sm mt-4">Check-in saved!</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn-form-next mt-4 py-3 px-6"
      >
        {loading ? "Saving…" : "Save check-in"}
      </button>
    </form>
  );
}
