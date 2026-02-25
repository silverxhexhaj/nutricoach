"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ProgramDay, ProgramItem, MergedProgramItem } from "@/types/program";
import { ContentItemCard } from "./ContentItemCard";
import { AddContentItemModal } from "./AddContentItemModal";
import { Spinner } from "@/components/ui/Spinner";

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDayOfWeek(dayNumber: number, startDay: string): string {
  const startIndex = WEEKDAY_NAMES.findIndex(
    (d) => d.toLowerCase() === startDay.slice(0, 3).toLowerCase()
  );
  const idx = (startIndex + ((dayNumber - 1) % 7)) % 7;
  return WEEKDAY_NAMES[idx];
}

function getDateForDay(dayNumber: number, startDate: string): string {
  const start = new Date(startDate);
  const d = new Date(start);
  d.setDate(d.getDate() + (dayNumber - 1));
  const weekday = WEEKDAY_NAMES[d.getDay()];
  const month = d.toLocaleString("en-US", { month: "short" });
  return `${weekday} ${month} ${d.getDate()}`;
}

interface DayColumnProps {
  day: ProgramDay;
  programId: string;
  startDay: string;
  readOnly?: boolean;
  startDate?: string;
  clientProgramId?: string;
  dayCompletions?: Record<string, string>;
  itemCompletions?: Record<string, string>;
  coachClientView?: boolean;
}

export function DayColumn({
  day,
  programId,
  startDay,
  readOnly,
  startDate,
  clientProgramId,
  dayCompletions = {},
  itemCompletions = {},
  coachClientView,
}: DayColumnProps) {
  const router = useRouter();
  const [items, setItems] = useState<ProgramItem[]>(day.items);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<ProgramItem | null>(null);
  const [dayCompleteLoading, setDayCompleteLoading] = useState(false);
  const [savingItemIds, setSavingItemIds] = useState<Record<string, boolean>>({});
  const [localDayComplete, setLocalDayComplete] = useState<boolean | null>(
    dayCompletions[day.id] ? true : null
  );

  const weekdayLabel = getDayOfWeek(day.day_number, startDay);
  const dateLabel = startDate ? getDateForDay(day.day_number, startDate) : weekdayLabel;
  const dayCompletedAt = dayCompletions[day.id] ?? null;
  const isDayComplete = localDayComplete ?? !!dayCompletedAt;
  const showDayToggle = readOnly && clientProgramId && startDate;
  const showCoachDayStatus = coachClientView && !!dayCompletedAt;

  const handleDayCompleteToggle = useCallback(async () => {
    if (!clientProgramId) return;
    setDayCompleteLoading(true);
    try {
      const res = await fetch("/api/program-completions/day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientProgramId,
          programDayId: day.id,
          completed: !isDayComplete,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update");
      }
      setLocalDayComplete(!isDayComplete);
      router.refresh();
    } catch {
      setLocalDayComplete(isDayComplete);
    } finally {
      setDayCompleteLoading(false);
    }
  }, [clientProgramId, day.id, isDayComplete, router]);

  const handleItemCompletionChange = useCallback(
    async (itemId: string, completed: boolean) => {
      if (!clientProgramId) return;
      if (savingItemIds[itemId]) return;
      setSavingItemIds((prev) => ({ ...prev, [itemId]: true }));
      try {
        const res = await fetch("/api/program-completions/item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientProgramId,
            programItemId: itemId,
            completed,
          }),
        });
        if (res.ok) router.refresh();
      } finally {
        setSavingItemIds((prev) => ({ ...prev, [itemId]: false }));
      }
    },
    [clientProgramId, router, savingItemIds]
  );

  const handleItemSaved = (item: ProgramItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) return prev.map((i) => (i.id === item.id ? item : i));
      return [...prev, item];
    });
    setEditItem(null);
  };

  const handleItemDeleted = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const [overrideSaving, setOverrideSaving] = useState(false);

  const handleOverrideAction = useCallback(
    async (action: "hide" | "add", sourceItemId?: string) => {
      if (!clientProgramId) return;
      setOverrideSaving(true);
      try {
        const body: Record<string, unknown> = {
          clientProgramId,
          dayId: day.id,
          action,
        };
        if (sourceItemId) body.sourceItemId = sourceItemId;
        const res = await fetch(`/api/programs/${programId}/client-overrides`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) router.refresh();
      } finally {
        setOverrideSaving(false);
      }
    },
    [clientProgramId, day.id, programId, router]
  );

  const handleRemoveOverride = useCallback(
    async (overrideId: string) => {
      setOverrideSaving(true);
      try {
        const res = await fetch(`/api/programs/${programId}/client-overrides`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ overrideId }),
        });
        if (res.ok) router.refresh();
      } finally {
        setOverrideSaving(false);
      }
    },
    [programId, router]
  );

  const canEdit = !readOnly && !coachClientView;
  const showAddButton = canEdit || coachClientView;

  return (
    <>
      <div className="flex flex-col min-w-[200px] flex-1">
        {/* Day header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm">{day.day_number}</span>
            <span className="text-text-dim text-sm">{dateLabel}</span>
          </div>
          {showCoachDayStatus ? (
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-green/20 text-green border border-green/40">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Done
            </span>
          ) : showDayToggle ? (
            <button
              type="button"
              onClick={handleDayCompleteToggle}
              disabled={dayCompleteLoading}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                isDayComplete
                  ? "bg-green/20 text-green border border-green/40"
                  : "border border-[var(--green-08)] text-text-dim hover:border-green hover:text-green"
              }`}
              aria-label={isDayComplete ? "Mark day incomplete" : "Mark day complete"}
            >
              {isDayComplete ? (
                <>
                  {dayCompleteLoading ? (
                    <Spinner size="sm" className="border-current border-t-transparent" />
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  Done
                </>
              ) : (
                <>
                  {dayCompleteLoading && <Spinner size="sm" className="border-current border-t-transparent" />}
                  Mark complete
                </>
              )}
            </button>
          ) : showAddButton ? (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              disabled={overrideSaving}
              className="w-6 h-6 flex items-center justify-center rounded-full border border-green text-green hover:bg-green hover:text-dark transition-colors text-sm font-bold"
              aria-label={`Add item to day ${day.day_number}`}
            >
              +
            </button>
          ) : null}
        </div>

        {/* Items */}
        <div className="flex flex-col gap-2 flex-1">
          {items.map((item) => {
            const merged = item as MergedProgramItem;
            const isHidden = merged.isHidden;

            const completionKey = merged.overrideAction === "add"
              ? merged.overrideId ?? item.id
              : item.id;

            return (
              <ContentItemCard
                key={item.id}
                item={item}
                programId={programId}
                onEdit={canEdit ? (i) => { setEditItem(i); setShowAddModal(true); } : undefined}
                onDeleted={canEdit ? handleItemDeleted : undefined}
                readOnly={readOnly || coachClientView}
                clientProgramId={clientProgramId}
                completedAt={
                  (item.type === "workout" || item.type === "meal")
                    ? itemCompletions[completionKey] ?? null
                    : null
                }
                onCompletionChange={
                  readOnly && !coachClientView && clientProgramId && (item.type === "workout" || item.type === "meal")
                    ? (completed) => handleItemCompletionChange(item.id, completed)
                    : undefined
                }
                completionSaving={!!savingItemIds[item.id]}
                coachClientView={coachClientView}
                isHidden={isHidden}
                isCustomized={merged.isCustomized}
                isClientOnly={merged.isClientOnly}
                overrideId={merged.overrideId}
                onHideItem={
                  coachClientView && !isHidden && !merged.isClientOnly
                    ? () => handleOverrideAction("hide", item.id)
                    : undefined
                }
                onResetOverride={
                  coachClientView && merged.overrideId
                    ? () => handleRemoveOverride(merged.overrideId!)
                    : undefined
                }
              />
            );
          })}
          {items.length === 0 && showAddButton && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="h-16 rounded-lg border border-dashed border-[var(--green-08)] text-text-dim text-xs hover:border-green hover:text-green transition-colors"
            >
              + Add content
            </button>
          )}
        </div>
      </div>

      {(canEdit || coachClientView) && showAddModal && (
        <AddContentItemModal
          programId={programId}
          dayId={day.id}
          editItem={editItem}
          onClose={() => { setShowAddModal(false); setEditItem(null); }}
          onSaved={handleItemSaved}
          clientProgramId={coachClientView ? clientProgramId : undefined}
        />
      )}
    </>
  );
}
