"use client";

import { useState, useEffect, useCallback } from "react";

interface CheckinRecord {
  date: string;
  weight_kg: number | null;
  water_ml: number | null;
  calories: number | null;
  protein_g: number | null;
  workout_done: boolean | null;
  energy_level: number | null;
  notes: string | null;
}

interface CheckInCalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string, checkin: CheckinRecord | null) => void;
  /** Increment to trigger refetch (e.g. after form save) */
  refreshTrigger?: number;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthBounds(year: number, month: number): { from: string; to: string } {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  return {
    from: first.toISOString().slice(0, 10),
    to: last.toISOString().slice(0, 10),
  };
}

function getCalendarDays(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const result: (string | null)[] = [];

  for (let i = 0; i < startPad; i++) result.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    result.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  return result;
}

export function CheckInCalendar({ selectedDate, onSelectDate, refreshTrigger }: CheckInCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCheckins = useCallback(async () => {
    const { from, to } = getMonthBounds(year, month);
    setLoading(true);
    try {
      const res = await fetch(`/api/checkins?from=${from}&to=${to}`);
      const data = await res.json();
      if (res.ok) setCheckins(data.checkins ?? []);
      else setCheckins([]);
    } catch {
      setCheckins([]);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins, refreshTrigger]);

  const checkinByDate = new Map(checkins.map((c) => [c.date, c]));
  const today = now.toISOString().slice(0, 10);
  const days = getCalendarDays(year, month);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const handleDayClick = (date: string) => {
    const checkin = checkinByDate.get(date) ?? null;
    onSelectDate(date, checkin);
  };

  return (
    <div className="bg-card border border-[var(--green-08)] rounded-xl p-6 mb-8">
      <h3 className="font-heading font-bold text-lg mb-4">Check-In History</h3>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="text-text-dim hover:text-green transition-colors p-1"
          aria-label="Previous month"
        >
          ←
        </button>
        <span className="font-medium text-sm">
          {new Date(year, month).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="text-text-dim hover:text-green transition-colors p-1"
          aria-label="Next month"
        >
          →
        </button>
      </div>
      {loading ? (
        <p className="text-text-dim text-sm py-8 text-center">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_LABELS.map((label) => (
              <div key={label} className="text-center text-[10px] text-text-dim font-medium">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => {
              if (!date) {
                return <div key={`empty-${i}`} className="aspect-square" />;
              }
              const hasCheckin = checkinByDate.has(date);
              const isToday = date === today;
              const isSelected = date === selectedDate;
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => handleDayClick(date)}
                  className={`aspect-square rounded-lg text-xs font-medium transition-colors flex flex-col items-center justify-center ${
                    isSelected
                      ? "bg-green text-dark"
                      : hasCheckin
                        ? "bg-[var(--green-08)] text-green hover:bg-[var(--green-12)]"
                        : "bg-[var(--green-08)] text-text-dim hover:bg-[var(--green-12)]"
                  }`}
                  title={date}
                >
                  {new Date(date).getDate()}
                  {hasCheckin && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green mt-0.5" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
