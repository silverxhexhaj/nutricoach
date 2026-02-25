"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { FoodSearchResult, MealSlot } from "@/types/food";

interface FoodSearchProps {
  defaultMealSlot?: MealSlot;
  onSelect: (food: FoodSearchResult, mealSlot: MealSlot) => void;
  /** When true, renders inline (no absolute dropdown) */
  inline?: boolean;
}

function MacroPill({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <span className="text-xs text-text-dim">
      <span className="text-text font-medium">{value}{unit}</span> {label}
    </span>
  );
}

export function FoodSearch({ onSelect, defaultMealSlot = "snack", inline = false }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>(defaultMealSlot);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(q)}&pageSize=12`);
      const data = await res.json() as { foods?: FoodSearchResult[] };
      setResults(data.foods ?? []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query.trim()), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  function handleSelect(food: FoodSearchResult) {
    onSelect(food, selectedSlot);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food (e.g. chicken breast, oats…)"
            className="form-input w-full pr-10"
            autoComplete="off"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="inline-block w-4 h-4 border-2 border-green border-t-transparent rounded-full animate-spin" />
            </span>
          )}
          {!loading && query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
        <select
          value={selectedSlot}
          onChange={(e) => setSelectedSlot(e.target.value as MealSlot)}
          className="form-input text-sm min-w-[110px]"
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
          <option value="supplement">Supplement</option>
        </select>
      </div>

      {open && results.length > 0 && (
        <div className={`${inline ? "mt-2" : "absolute top-full mt-1 left-0 right-0 z-50"} bg-card border border-[var(--green-08)] rounded-xl overflow-hidden shadow-xl max-h-72 overflow-y-auto`}>
          {results.map((food) => (
            <button
              key={food.fdcId}
              type="button"
              onClick={() => handleSelect(food)}
              className="w-full text-left px-4 py-3 hover:bg-[var(--green-08)] transition-colors border-b border-white/5 last:border-0 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text truncate group-hover:text-green transition-colors">
                    {food.name}
                  </p>
                  {food.brand && (
                    <p className="text-xs text-text-dim truncate">{food.brand}</p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-green">{food.calories} kcal</p>
                  <p className="text-xs text-text-dim">per {food.servingSize}{food.servingUnit}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-1">
                <MacroPill label="P" value={food.protein_g} unit="g" />
                <MacroPill label="C" value={food.carbs_g} unit="g" />
                <MacroPill label="F" value={food.fat_g} unit="g" />
              </div>
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-card border border-[var(--green-08)] rounded-xl px-4 py-3 text-sm text-text-dim">
          No foods found for &ldquo;{query}&rdquo;. Try a different search term.
        </div>
      )}
    </div>
  );
}
