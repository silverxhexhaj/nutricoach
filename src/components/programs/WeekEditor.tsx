"use client";

import { useState } from "react";
import type { Program, ProgramDay } from "@/types/program";
import { DayColumn } from "./DayColumn";

type ViewMode = "day" | "week" | "month";

interface WeekEditorProps {
  program: Program;
  days: ProgramDay[];
  readOnly?: boolean;
  startDate?: string;
  clientProgramId?: string;
  dayCompletions?: Record<string, string>;
  itemCompletions?: Record<string, string>;
  /** Coach viewing/editing a specific client's program (with overrides) */
  coachClientView?: boolean;
}

function getTodayDayNumber(startDate: string, totalDays: number): number | null {
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0 || diffDays >= totalDays) return null;
  return diffDays + 1;
}

function getProgramDayDisplay(startDate: string, totalDays: number): number {
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 1;
  if (diffDays >= totalDays) return totalDays;
  return diffDays + 1;
}

export function WeekEditor({
  program,
  days,
  readOnly,
  startDate,
  clientProgramId,
  dayCompletions = {},
  itemCompletions = {},
  coachClientView,
}: WeekEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentWeek, setCurrentWeek] = useState(1);

  const totalWeeks = program.duration_weeks;
  const daysPerWeek = 7;
  const totalDays = totalWeeks * daysPerWeek;

  // Slice days for the current week view
  const weekStart = (currentWeek - 1) * daysPerWeek;
  const weekEnd = Math.min(weekStart + daysPerWeek, totalDays);
  const currentWeekDays = days.slice(weekStart, weekEnd);

  // For month view: all days in groups of 7
  const allWeeks = Array.from({ length: totalWeeks }, (_, i) => ({
    week: i + 1,
    days: days.slice(i * daysPerWeek, (i + 1) * daysPerWeek),
  }));

  // For day view: single day navigation
  const [currentDay, setCurrentDay] = useState(1);
  const currentDayData = days.find((d) => d.day_number === currentDay) ?? days[0];
  const todayDayNumber = startDate ? getTodayDayNumber(startDate, totalDays) : null;
  const completedDays = Object.keys(dayCompletions).length;
  const completionPercentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  const dayDisplay = startDate ? getProgramDayDisplay(startDate, totalDays) : 1;

  const dayColumnProps = {
    programId: program.id,
    startDay: program.start_day,
    readOnly,
    startDate,
    clientProgramId,
    dayCompletions,
    itemCompletions,
    coachClientView,
  };

  return (
    <div>
      {readOnly && startDate && (
        <div className="mb-5 rounded-lg border border-[var(--green-10)] bg-[var(--green-08)] p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="font-medium">
              Day {dayDisplay} of {totalDays}
            </p>
            <p className="text-text-dim">
              {completedDays}/{totalDays} completed
            </p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-dark overflow-hidden">
            <div
              className="h-full bg-green transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-xs text-text-dim mt-2">{completionPercentage}% complete</p>
        </div>
      )}
      {/* Editor header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        {/* Week title (not shown in month view) */}
        {viewMode !== "month" && (
          <div className="flex items-center gap-3">
            {viewMode === "week" && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentWeek((w) => Math.max(1, w - 1))}
                  disabled={currentWeek === 1}
                  className="p-1.5 text-text-dim hover:text-green disabled:opacity-30 transition-colors"
                  aria-label="Previous week"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <h3 className="font-heading font-bold text-xl">Week {currentWeek}</h3>
                <button
                  type="button"
                  onClick={() => setCurrentWeek((w) => Math.min(totalWeeks, w + 1))}
                  disabled={currentWeek === totalWeeks}
                  className="p-1.5 text-text-dim hover:text-green disabled:opacity-30 transition-colors"
                  aria-label="Next week"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
            {viewMode === "day" && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentDay((d) => Math.max(1, d - 1))}
                  disabled={currentDay === 1}
                  className="p-1.5 text-text-dim hover:text-green disabled:opacity-30 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <h3 className="font-heading font-bold text-xl">Day {currentDay}</h3>
                <button
                  type="button"
                  onClick={() => setCurrentDay((d) => Math.min(totalDays, d + 1))}
                  disabled={currentDay === totalDays}
                  className="p-1.5 text-text-dim hover:text-green disabled:opacity-30 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
        {viewMode === "month" && (
          <h3 className="font-heading font-bold text-xl">All Weeks</h3>
        )}

        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden border border-[var(--green-08)]">
          {(["day", "week", "month"] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setViewMode(v)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                viewMode === v
                  ? "bg-[var(--green-10)] text-green"
                  : "text-text-dim hover:text-green hover:bg-[var(--green-08)]"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content grid */}
      {viewMode === "day" && currentDayData && (
        <div className={`max-w-sm ${todayDayNumber === currentDayData.day_number ? "ring-2 ring-green rounded-lg p-1" : ""}`}>
          <DayColumn day={currentDayData} {...dayColumnProps} />
        </div>
      )}

      {viewMode === "week" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {currentWeekDays.map((day) => (
              <div key={day.id} className={`w-[200px] ${todayDayNumber === day.day_number ? "ring-2 ring-green rounded-lg" : ""}`}>
                <DayColumn day={day} {...dayColumnProps} />
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === "month" && (
        <div className="space-y-10">
          {allWeeks.map(({ week, days: wDays }) => (
            <div key={week}>
              <h4 className="font-heading font-bold text-base mb-4 text-text-dim">Week {week}</h4>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-4 min-w-max">
                  {wDays.map((day) => (
                    <div key={day.id} className={`w-[200px] ${todayDayNumber === day.day_number ? "ring-2 ring-green rounded-lg" : ""}`}>
                      <DayColumn day={day} {...dayColumnProps} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info note */}
      <div className="mt-6 p-4 bg-[var(--green-08)] rounded-lg border border-[var(--green-10)]">
        <p className="text-xs text-text-dim">
          {readOnly && startDate ? (
            <>
              <strong className="text-green">Your program:</strong> Day 1 started on{" "}
              {new Date(startDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}.
              {todayDayNumber !== null && (
                <> Today is Day {todayDayNumber}.</>
              )}
            </>
          ) : (
            <>
              <strong className="text-green">How programs work:</strong> Programs are organized by days. Day 1 starts when you assign this program to a client. If you assign it on{" "}
              <span className="capitalize">{program.start_day}</span>, Day 1 will be that{" "}
              <span className="capitalize">{program.start_day}</span> and each subsequent day follows.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
