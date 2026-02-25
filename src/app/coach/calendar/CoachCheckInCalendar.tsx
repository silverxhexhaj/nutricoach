"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";

interface CoachCheckInCalendarProps {
  clientMap: Record<string, string>;
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
    result.push(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    );
  }
  return result;
}

export function CoachCheckInCalendar({ clientMap }: CoachCheckInCalendarProps) {
  const total = Object.keys(clientMap).length;
  const clientIds = Object.keys(clientMap);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [checkinsByDate, setCheckinsByDate] = useState<Map<string, { count: number; clientIds: string[] }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchCheckins = useCallback(async () => {
    const { from, to } = getMonthBounds(year, month);
    setLoading(true);
    try {
      const res = await fetch(`/api/coach/checkins?from=${from}&to=${to}`);
      const data = await res.json();
      if (res.ok) {
        const map = new Map<string, { count: number; clientIds: string[] }>();
        for (const item of data.checkins ?? []) {
          map.set(item.date, {
            count: item.count ?? 0,
            clientIds: item.client_ids ?? [],
          });
        }
        setCheckinsByDate(map);
      } else {
        setCheckinsByDate(new Map());
      }
    } catch {
      setCheckinsByDate(new Map());
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

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

  const getDayStyle = (date: string) => {
    const count = checkinsByDate.get(date)?.count ?? 0;
    if (total === 0) return "bg-[var(--green-08)] text-text-dim";
    if (count === total) return "bg-green text-dark";
    if (count > 0) return "bg-green/40 text-dark";
    return "bg-[var(--green-08)] text-text-dim";
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  const selectedSummary = selectedDate ? checkinsByDate.get(selectedDate) : null;
  const checkedInIds = selectedSummary?.clientIds ?? [];
  const notCheckedInIds = clientIds.filter((id) => !checkedInIds.includes(id));

  return (
    <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="text-text-dim hover:text-green transition-colors p-1"
            aria-label="Previous month"
          >
            ←
          </button>
          <span className="font-medium text-sm">
            {new Date(year, month).toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            })}
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
        <button
          type="button"
          onClick={handleJumpToToday}
          className="text-xs px-2.5 py-1.5 rounded-md border border-[var(--green-20)] text-text-dim hover:text-green hover:border-green transition-colors"
        >
          Today
        </button>
      </div>
      {loading ? (
        <p className="text-text-dim text-sm py-8 text-center">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="text-center text-[10px] text-text-dim font-medium"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => {
              if (!date) {
                return <div key={`empty-${i}`} className="aspect-square" />;
              }
              const count = checkinsByDate.get(date)?.count ?? 0;
              return (
                <button
                  type="button"
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square rounded-lg text-xs font-medium flex flex-col items-center justify-center ${getDayStyle(date)}`}
                  title={`${date}: ${count}/${total} clients`}
                >
                  {new Date(date).getDate()}
                  {total > 0 && (
                    <span className="text-[10px] opacity-80 mt-0.5">
                      {count}/{total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-text-dim mt-4">
            {total} client{total !== 1 ? "s" : ""} total
          </p>
        </>
      )}
      <Modal
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? `Check-ins for ${new Date(selectedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : "Check-ins"}
        maxWidthClassName="max-w-lg"
      >
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium mb-1 text-green">Checked in ({checkedInIds.length})</p>
            {checkedInIds.length === 0 ? (
              <p className="text-text-dim">No clients checked in.</p>
            ) : (
              <ul className="space-y-1 text-text-dim">
                {checkedInIds.map((id) => (
                  <li key={id}>{clientMap[id] ?? "Unnamed client"}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="font-medium mb-1 text-text-dim">Not checked in ({notCheckedInIds.length})</p>
            {notCheckedInIds.length === 0 ? (
              <p className="text-green">All clients checked in.</p>
            ) : (
              <ul className="space-y-1 text-text-dim">
                {notCheckedInIds.map((id) => (
                  <li key={id}>{clientMap[id] ?? "Unnamed client"}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
