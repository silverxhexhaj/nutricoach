"use client";

import { useState } from "react";
import type { ProgramItem, ProgramItemType } from "@/types/program";
import { Spinner } from "@/components/ui/Spinner";

const TYPE_ICONS: Record<ProgramItemType, { icon: string; color: string; label: string }> = {
  workout: { icon: "⚡", color: "text-yellow-400", label: "Workout" },
  exercise: { icon: "⚡", color: "text-green", label: "Exercise" },
  meal: { icon: "🥗", color: "text-emerald-400", label: "Meal" },
  video: { icon: "▶", color: "text-blue-400", label: "Video" },
  text: { icon: "≡", color: "text-text-dim", label: "Text" },
};

interface ContentItemCardProps {
  item: ProgramItem;
  programId: string;
  onEdit?: (item: ProgramItem) => void;
  onDeleted?: (id: string) => void;
  readOnly?: boolean;
  clientProgramId?: string;
  completedAt?: string | null;
  onCompletionChange?: (completed: boolean) => void;
  completionSaving?: boolean;
  coachClientView?: boolean;
  isHidden?: boolean;
  isCustomized?: boolean;
  isClientOnly?: boolean;
  overrideId?: string;
  onHideItem?: () => void;
  onResetOverride?: () => void;
}

export function ContentItemCard({
  item,
  programId,
  onEdit,
  onDeleted,
  readOnly,
  clientProgramId,
  completedAt,
  onCompletionChange,
  completionSaving = false,
  coachClientView,
  isHidden,
  isCustomized,
  isClientOnly,
  onHideItem,
  onResetOverride,
}: ContentItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const meta = TYPE_ICONS[item.type];
  const showCompletionCheckbox =
    readOnly && !coachClientView && clientProgramId && onCompletionChange && (item.type === "workout" || item.type === "meal");
  const isComplete = !!completedAt;
  const showCoachCompletionBadge =
    coachClientView && (item.type === "workout" || item.type === "meal") && isComplete;

  const handleDelete = async () => {
    if (!onDeleted) return;
    if (!confirm(`Delete "${item.title}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/programs/${programId}/items/${item.id}`, { method: "DELETE" });
      if (res.ok) onDeleted(item.id);
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  return (
    <div className={`relative bg-dark rounded-lg border transition-colors p-3 ${
      isHidden
        ? "border-red-400/20 opacity-50"
        : "border-[var(--green-08)] hover:border-[var(--green-20)]"
    }`}>
      <div className="flex items-start gap-2">
        {showCompletionCheckbox && (
          <button
            type="button"
            onClick={() => onCompletionChange(!isComplete)}
            disabled={completionSaving}
            className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isComplete
                ? "bg-green border-green"
                : "border-[var(--green-20)] hover:border-green"
            } disabled:opacity-70`}
            aria-label={isComplete ? "Mark incomplete" : "Mark complete"}
          >
            {completionSaving ? (
              <Spinner size="sm" className="border-white border-t-transparent" />
            ) : isComplete && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        )}
        {showCoachCompletionBadge && (
          <div className="shrink-0 w-5 h-5 rounded bg-green/20 border border-green/40 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${meta.color}`}>
              <span className="mr-1">{meta.icon}</span>
              {meta.label}
            </p>
            {isHidden && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-red-400/20 text-red-300 font-medium">Hidden</span>
            )}
            {isCustomized && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-blue-400/20 text-blue-300 font-medium">Customized</span>
            )}
            {isClientOnly && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-purple-400/20 text-purple-300 font-medium">Client only</span>
            )}
          </div>
          <p className={`text-sm font-medium truncate ${isHidden ? "line-through" : ""}`}>{item.title}</p>
          {item.type === "workout" && item.content && (
            <p className="text-xs text-text-dim mt-0.5">
              {((item.content as { exercises?: unknown[] }).exercises?.length ?? 0)} exercise{((item.content as { exercises?: unknown[] }).exercises?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          )}
          {item.type === "exercise" && item.content && (
            <p className="text-xs text-text-dim mt-0.5">
              {(item.content as { sets?: unknown }).sets ? `${(item.content as { sets?: unknown; reps?: unknown }).sets} × ${(item.content as { sets?: unknown; reps?: unknown }).reps ?? "—"}` : ""}
            </p>
          )}
          {item.type === "meal" && item.content && (
            <p className="text-xs text-text-dim mt-0.5">
              {((item.content as { foods?: unknown[] }).foods?.length ?? 0)} food{((item.content as { foods?: unknown[] }).foods?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          )}
          {item.type === "video" && item.content && (
            <p className="text-xs text-text-dim mt-0.5 truncate">
              {(item.content as { url?: string }).url ?? ""}
            </p>
          )}
          {item.type === "text" && item.content && (
            <p className="text-xs text-text-dim mt-0.5 line-clamp-2">
              {(item.content as { body?: string }).body ?? ""}
            </p>
          )}
        </div>

        {!readOnly && !coachClientView && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="shrink-0 p-1 text-text-dim hover:text-green hover:bg-[var(--green-08)] rounded transition-colors"
            aria-label="Item options"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>
        )}

        {coachClientView && (onHideItem || onResetOverride) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="shrink-0 p-1 text-text-dim hover:text-green hover:bg-[var(--green-08)] rounded transition-colors"
            aria-label="Override options"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>
        )}
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-8 right-2 z-20 bg-card border border-[var(--green-08)] rounded-lg shadow-xl py-1 min-w-[140px]">
            {!readOnly && !coachClientView && (
              <>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onEdit?.(item); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--green-08)] hover:text-green transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )}

            {coachClientView && onHideItem && !isHidden && (
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onHideItem(); }}
                className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-400/10 transition-colors"
              >
                Hide for client
              </button>
            )}
            {coachClientView && onResetOverride && (
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onResetOverride(); }}
                className="w-full text-left px-4 py-2 text-sm text-blue-300 hover:bg-blue-400/10 transition-colors"
              >
                {isHidden ? "Restore item" : isClientOnly ? "Remove item" : "Reset to template"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
