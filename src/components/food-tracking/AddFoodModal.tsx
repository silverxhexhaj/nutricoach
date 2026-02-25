"use client";

import { useState } from "react";
import type { FoodSearchResult, MealSlot, AddFoodLogPayload } from "@/types/food";
import { MEAL_SLOT_LABELS, MEAL_SLOTS } from "@/types/food";

interface AddFoodModalProps {
  food: FoodSearchResult;
  initialMealSlot: MealSlot;
  checkinDate: string;
  onAdded: () => void;
  onClose: () => void;
}

function MacroBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${color}`}>{value.toFixed(1)}</p>
      <p className="text-xs text-text-dim uppercase tracking-wider">{label}</p>
    </div>
  );
}

export function AddFoodModal({
  food,
  initialMealSlot,
  checkinDate,
  onAdded,
  onClose,
}: AddFoodModalProps) {
  const [serving, setServing] = useState(food.servingSize);
  const [mealSlot, setMealSlot] = useState<MealSlot>(initialMealSlot);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scale = serving / food.servingSize;
  const computed = {
    calories: Math.round(food.calories * scale),
    protein_g: Math.round(food.protein_g * scale * 10) / 10,
    carbs_g: Math.round(food.carbs_g * scale * 10) / 10,
    fat_g: Math.round(food.fat_g * scale * 10) / 10,
    fiber_g: food.fiber_g != null ? Math.round(food.fiber_g * scale * 10) / 10 : undefined,
  };

  async function handleAdd() {
    setError(null);
    setLoading(true);
    try {
      const payload: AddFoodLogPayload = {
        checkin_date: checkinDate,
        meal_slot: mealSlot,
        food_name: food.name,
        brand: food.brand,
        serving_size: serving,
        serving_unit: food.servingUnit,
        calories: computed.calories,
        protein_g: computed.protein_g,
        carbs_g: computed.carbs_g,
        fat_g: computed.fat_g,
        fiber_g: computed.fiber_g,
        source: food.source,
        source_id: food.fdcId,
        barcode: food.barcode,
      };

      const res = await fetch("/api/food-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to add food");

      onAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add food");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-card border border-[var(--green-08)] rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-text-dim hover:text-text text-xl leading-none"
        >
          ×
        </button>

        {/* Food header */}
        <div className="mb-5 pr-6">
          <h3 className="font-heading font-bold text-base text-text leading-tight">
            {food.name}
          </h3>
          {food.brand && (
            <p className="text-xs text-text-dim mt-0.5">{food.brand}</p>
          )}
        </div>

        {/* Macro summary */}
        <div className="bg-mid rounded-xl p-4 mb-5 grid grid-cols-4 gap-2">
          <MacroBar label="kcal" value={computed.calories} color="text-green" />
          <MacroBar label="protein" value={computed.protein_g} color="text-text" />
          <MacroBar label="carbs" value={computed.carbs_g} color="text-text" />
          <MacroBar label="fat" value={computed.fat_g} color="text-text" />
        </div>

        {/* Serving size */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
            Serving size ({food.servingUnit})
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setServing((s) => Math.max(1, Math.round(s - 10)))}
              className="w-10 h-10 rounded-lg bg-[var(--green-08)] text-text hover:bg-[var(--green-12)] transition-colors font-bold text-lg"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              value={serving}
              onChange={(e) => setServing(Math.max(1, parseFloat(e.target.value) || 1))}
              className="form-input flex-1 text-center"
            />
            <button
              type="button"
              onClick={() => setServing((s) => Math.round(s + 10))}
              className="w-10 h-10 rounded-lg bg-[var(--green-08)] text-text hover:bg-[var(--green-12)] transition-colors font-bold text-lg"
            >
              +
            </button>
          </div>
          <p className="text-xs text-text-dim mt-1">
            Reference: {food.servingSize}{food.servingUnit} per serving
          </p>
        </div>

        {/* Meal slot */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
            Add to meal
          </label>
          <div className="flex flex-wrap gap-2">
            {MEAL_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setMealSlot(slot)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  mealSlot === slot
                    ? "bg-green text-dark"
                    : "bg-[var(--green-08)] text-text-dim hover:bg-[var(--green-12)]"
                }`}
              >
                {MEAL_SLOT_LABELS[slot]}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          type="button"
          onClick={handleAdd}
          disabled={loading}
          className="w-full btn-form-next py-3"
        >
          {loading ? "Adding…" : `Add to ${MEAL_SLOT_LABELS[mealSlot]}`}
        </button>
      </div>
    </div>
  );
}
