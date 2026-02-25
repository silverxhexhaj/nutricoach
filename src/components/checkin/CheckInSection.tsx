"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckInForm } from "./CheckInForm";
import { CheckInCalendar } from "./CheckInCalendar";

export interface CheckInSectionProps {
  todayCheckin?: {
    weight_kg: number | null;
    water_ml: number | null;
    calories: number | null;
    protein_g: number | null;
    workout_done: boolean | null;
    energy_level: number | null;
    notes: string | null;
  } | null;
  calorieTarget?: number;
  proteinTarget?: number;
  onSaved?: () => void;
}

export function CheckInSection({
  todayCheckin,
  calorieTarget,
  proteinTarget,
  onSaved,
}: CheckInSectionProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateCheckin, setSelectedDateCheckin] = useState<{
    weight_kg: number | null;
    water_ml: number | null;
    calories: number | null;
    protein_g: number | null;
    workout_done: boolean | null;
    energy_level: number | null;
    notes: string | null;
  } | null>(null);
  const [calendarRefresh, setCalendarRefresh] = useState(0);

  const handleSelectDate = useCallback((date: string, checkin: CheckInSectionProps["todayCheckin"]) => {
    setSelectedDate(date);
    setSelectedDateCheckin(checkin ?? null);
  }, []);

  const handleCheckinSaved = useCallback(() => {
    router.refresh();
    setCalendarRefresh((k) => k + 1);
    onSaved?.();
  }, [router, onSaved]);

  const today = new Date().toISOString().slice(0, 10);
  const showToday = selectedDate == null || selectedDate === today;
  const formCheckin = showToday ? todayCheckin : selectedDateCheckin;
  const formDate = showToday ? undefined : selectedDate ?? undefined;

  return (
    <section id="checkin">
      <CheckInCalendar
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        refreshTrigger={calendarRefresh}
      />
      {selectedDate && selectedDate !== today && (
        <button
          type="button"
          onClick={() => setSelectedDate(null)}
          className="text-sm text-text-dim hover:text-green transition-colors mb-2"
        >
          ← Back to today
        </button>
      )}
      <CheckInForm
        todayCheckin={formCheckin ?? null}
        date={formDate}
        onSaved={handleCheckinSaved}
        calorieTarget={calorieTarget}
        proteinTarget={proteinTarget}
      />
    </section>
  );
}
