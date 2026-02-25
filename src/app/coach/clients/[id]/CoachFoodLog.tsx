"use client";

import { useState } from "react";
import { DailyFoodLog } from "@/components/food-tracking/DailyFoodLog";

interface CoachFoodLogProps {
  clientId: string;
  calorieTarget?: number | null;
  proteinTarget?: number | null;
}

export function CoachFoodLog({
  clientId,
  calorieTarget,
  proteinTarget,
}: CoachFoodLogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);

  return (
    <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h2 className="font-heading font-bold text-base">Food Log</h2>
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

      <DailyFoodLog
        date={selectedDate}
        clientId={clientId}
        calorieTarget={calorieTarget ?? undefined}
        proteinTarget={proteinTarget ?? undefined}
        readOnly
      />
    </div>
  );
}
