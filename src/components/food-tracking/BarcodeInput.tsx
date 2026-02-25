"use client";

import { useState } from "react";
import type { FoodSearchResult, MealSlot } from "@/types/food";

interface BarcodeInputProps {
  defaultMealSlot?: MealSlot;
  onFound: (food: FoodSearchResult, mealSlot: MealSlot) => void;
}

export function BarcodeInput({ defaultMealSlot = "snack", onFound }: BarcodeInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup() {
    const trimmed = code.trim().replace(/\D/g, "");
    if (!trimmed || trimmed.length < 8) {
      setError("Please enter a valid barcode (8+ digits)");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/foods/barcode?code=${trimmed}`);
      const data = (await res.json()) as { food?: FoodSearchResult; error?: string };
      if (!res.ok || !data.food) {
        throw new Error(data.error ?? "Product not found");
      }
      onFound(data.food, defaultMealSlot);
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Barcode lookup failed");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleLookup();
  }

  return (
    <div>
      <label className="block text-xs font-medium text-text-dim mb-1.5 uppercase tracking-wider">
        Enter Barcode
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(null); }}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 5060292302201"
          className="form-input flex-1"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={handleLookup}
          disabled={loading || code.trim().length < 8}
          className="btn-form-next px-4 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-dark border-t-transparent rounded-full animate-spin" />
              Looking up…
            </span>
          ) : (
            "Look up"
          )}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
      <p className="text-xs text-text-dim mt-1.5">
        Tip: Find the barcode number printed beneath the barcode on the product packaging.
      </p>
    </div>
  );
}
