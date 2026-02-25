"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  DailyFoodSummary,
  FoodLogEntry,
  FoodSearchResult,
  MealSlot,
} from "@/types/food";
import { MEAL_SLOT_LABELS, MEAL_SLOTS } from "@/types/food";
import { FoodSearch } from "./FoodSearch";
import { AddFoodModal } from "./AddFoodModal";
import { BarcodeInput } from "./BarcodeInput";

interface DailyFoodLogProps {
  date: string;
  /** Targets from the active plan */
  calorieTarget?: number;
  proteinTarget?: number;
  /** When true, disables adding/deleting entries (coach view) */
  readOnly?: boolean;
  /** Optional: coach viewing a specific client's log */
  clientId?: string;
  /** Called whenever entries change, with the new totals */
  onTotalsChange?: (calories: number, protein_g: number) => void;
}

interface TargetBarProps {
  label: string;
  current: number;
  target?: number;
  unit: string;
  color?: string;
}

function TargetBar({ label, current, target, unit, color = "bg-green" }: TargetBarProps) {
  const pct = target ? Math.min(100, (current / target) * 100) : 0;
  const over = target ? current > target : false;

  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs text-text-dim uppercase tracking-wider">{label}</span>
        <span className="text-xs font-medium">
          <span className={over ? "text-yellow-400" : "text-text"}>{Math.round(current)}</span>
          {target && <span className="text-text-dim">/{target}{unit}</span>}
          {!target && <span className="text-text-dim">{unit}</span>}
        </span>
      </div>
      {target && (
        <div className="h-1.5 rounded-full bg-mid overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${over ? "bg-yellow-400" : color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function FoodEntryRow({
  entry,
  onDelete,
  readOnly,
}: {
  entry: FoodLogEntry;
  onDelete: (id: string) => void;
  readOnly: boolean;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/food-log?id=${entry.id}`, { method: "DELETE" });
      if (res.ok) onDelete(entry.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text truncate">{entry.food_name}</p>
        {entry.brand && <p className="text-xs text-text-dim truncate">{entry.brand}</p>}
        <p className="text-xs text-text-dim">
          {entry.serving_size}{entry.serving_unit}
        </p>
      </div>
      <div className="flex gap-3 text-right flex-shrink-0">
        <div>
          <p className="text-sm font-bold text-green">{Math.round(entry.calories)}</p>
          <p className="text-xs text-text-dim">kcal</p>
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-text">{entry.protein_g.toFixed(1)}g</p>
          <p className="text-xs text-text-dim">P</p>
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-text">{entry.carbs_g.toFixed(1)}g</p>
          <p className="text-xs text-text-dim">C</p>
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-text">{entry.fat_g.toFixed(1)}g</p>
          <p className="text-xs text-text-dim">F</p>
        </div>
      </div>
      {!readOnly && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex-shrink-0 w-7 h-7 rounded-lg text-text-dim hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm opacity-0 group-hover:opacity-100"
          title="Remove"
        >
          {deleting ? "…" : "×"}
        </button>
      )}
    </div>
  );
}

export function DailyFoodLog({
  date,
  calorieTarget,
  proteinTarget,
  readOnly = false,
  clientId,
  onTotalsChange,
}: DailyFoodLogProps) {
  const [summary, setSummary] = useState<DailyFoodSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [pendingFood, setPendingFood] = useState<{
    food: FoodSearchResult;
    mealSlot: MealSlot;
  } | null>(null);

  const fetchLog = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date });
      if (clientId) params.set("client_id", clientId);
      const res = await fetch(`/api/food-log?${params.toString()}`);
      if (!res.ok) return;
      const data = (await res.json()) as DailyFoodSummary;
      setSummary(data);
      onTotalsChange?.(data.total_calories, data.total_protein_g);
    } finally {
      setLoading(false);
    }
  }, [date, clientId, onTotalsChange]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  function handleFoodSelected(food: FoodSearchResult, mealSlot: MealSlot) {
    setPendingFood({ food, mealSlot });
    setShowSearch(false);
    setShowBarcode(false);
  }

  function handleEntryDeleted(deletedId: string) {
    if (!summary) return;
    const newEntries: Partial<Record<MealSlot, FoodLogEntry[]>> = {};
    for (const slot of MEAL_SLOTS) {
      const existing = summary.entries_by_meal[slot] ?? [];
      const filtered = existing.filter((e) => e.id !== deletedId);
      if (filtered.length > 0) newEntries[slot] = filtered;
    }
    const allEntries = Object.values(newEntries).flat();
    const newSummary: DailyFoodSummary = {
      date,
      total_calories: allEntries.reduce((s, e) => s + e.calories, 0),
      total_protein_g: allEntries.reduce((s, e) => s + e.protein_g, 0),
      total_carbs_g: allEntries.reduce((s, e) => s + e.carbs_g, 0),
      total_fat_g: allEntries.reduce((s, e) => s + e.fat_g, 0),
      entries_by_meal: newEntries,
    };
    setSummary(newSummary);
    onTotalsChange?.(newSummary.total_calories, newSummary.total_protein_g);
  }

  const totalEntries = summary
    ? Object.values(summary.entries_by_meal).flat().length
    : 0;

  return (
    <div>
      {/* Daily totals bar */}
      {summary && (
        <div className="bg-mid rounded-xl p-4 mb-4 flex gap-4 flex-wrap">
          <TargetBar
            label="Calories"
            current={summary.total_calories}
            target={calorieTarget}
            unit="kcal"
          />
          <TargetBar
            label="Protein"
            current={summary.total_protein_g}
            target={proteinTarget}
            unit="g"
          />
          <TargetBar
            label="Carbs"
            current={summary.total_carbs_g}
            unit="g"
            color="bg-blue-400"
          />
          <TargetBar
            label="Fat"
            current={summary.total_fat_g}
            unit="g"
            color="bg-orange-400"
          />
        </div>
      )}

      {/* Add food controls */}
      {!readOnly && (
        <div className="mb-4">
          {!showSearch && !showBarcode && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                className="flex-1 btn-form-next py-2.5 text-sm"
              >
                + Search Food
              </button>
              <button
                type="button"
                onClick={() => setShowBarcode(true)}
                className="px-4 py-2.5 rounded-xl bg-[var(--green-08)] text-text text-sm font-medium hover:bg-[var(--green-12)] transition-colors"
                title="Look up by barcode"
              >
                Barcode
              </button>
            </div>
          )}

          {showSearch && (
            <div>
              <FoodSearch
                defaultMealSlot="snack"
                onSelect={handleFoodSelected}
              />
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="text-xs text-text-dim hover:text-text mt-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {showBarcode && (
            <div>
              <BarcodeInput onFound={handleFoodSelected} />
              <button
                type="button"
                onClick={() => setShowBarcode(false)}
                className="text-xs text-text-dim hover:text-text mt-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Food entries by meal slot */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-mid animate-pulse" />
          ))}
        </div>
      ) : totalEntries === 0 ? (
        <div className="text-center py-8 text-text-dim text-sm">
          {readOnly
            ? "No foods logged for this day."
            : "No foods logged yet. Search above to start tracking."}
        </div>
      ) : (
        <div className="space-y-4">
          {MEAL_SLOTS.map((slot) => {
            const entries = summary?.entries_by_meal[slot];
            if (!entries || entries.length === 0) return null;
            const slotCals = entries.reduce((s, e) => s + e.calories, 0);
            const slotProtein = entries.reduce((s, e) => s + e.protein_g, 0);

            return (
              <div key={slot}>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-medium text-text-dim uppercase tracking-wider">
                    {MEAL_SLOT_LABELS[slot]}
                  </h4>
                  <span className="text-xs text-text-dim">
                    {Math.round(slotCals)} kcal · {slotProtein.toFixed(1)}g P
                  </span>
                </div>
                <div className="bg-card border border-[var(--green-08)] rounded-xl px-4">
                  {entries.map((entry) => (
                    <FoodEntryRow
                      key={entry.id}
                      entry={entry}
                      onDelete={handleEntryDeleted}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AddFoodModal */}
      {pendingFood && (
        <AddFoodModal
          food={pendingFood.food}
          initialMealSlot={pendingFood.mealSlot}
          checkinDate={date}
          onAdded={() => {
            setPendingFood(null);
            fetchLog();
          }}
          onClose={() => setPendingFood(null)}
        />
      )}
    </div>
  );
}
