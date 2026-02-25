"use client";

import { useState } from "react";
import type { LibraryItem } from "@/types/program";
import { ITEM_TYPES } from "@/components/programs/ContentItemFields";

interface LibraryItemCardProps {
  item: LibraryItem;
  onEdit: (item: LibraryItem) => void;
  onDeleted: (id: string) => void;
}

function getPreviewSnippet(item: LibraryItem): string {
  if (item.type === "text" && item.content?.body) {
    return String(item.content.body).slice(0, 80) + (String(item.content.body).length > 80 ? "…" : "");
  }
  if (item.type === "video" && item.content?.url) {
    return String(item.content.url);
  }
  if (item.type === "workout" && Array.isArray(item.content?.exercises)) {
    const exs = item.content.exercises as { name: string }[];
    return exs.map((e) => e.name).filter(Boolean).join(", ") || "No exercises";
  }
  if (item.type === "meal" && Array.isArray(item.content?.foods)) {
    const foods = item.content.foods as { name: string }[];
    return foods.map((f) => f.name).filter(Boolean).join(", ") || "No foods";
  }
  if (item.type === "exercise") {
    const sets = item.content?.sets;
    const reps = item.content?.reps;
    if (sets || reps) return `${sets ?? "?"} sets × ${reps ?? "?"} reps`;
  }
  return "";
}

export function LibraryItemCard({ item, onEdit, onDeleted }: LibraryItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const typeInfo = ITEM_TYPES.find((t) => t.type === item.type);
  const preview = getPreviewSnippet(item);

  const handleDelete = async () => {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/library/${item.id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted(item.id);
      }
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  return (
    <div
      className="relative bg-card rounded-xl border border-[var(--green-08)] hover:border-[var(--green-20)] transition-colors group cursor-pointer"
      onClick={() => onEdit(item)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-2xl" aria-hidden>
            {typeInfo?.icon ?? "📄"}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="shrink-0 p-1 rounded-md text-text-dim hover:text-green hover:bg-[var(--green-08)] transition-colors"
            aria-label="Item options"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>
        </div>

        <h3 className="font-heading font-bold text-sm leading-tight line-clamp-2 mb-1">
          {item.title}
        </h3>

        <p className="text-[10px] text-text-dim uppercase mb-2">{typeInfo?.label ?? item.type}</p>

        {preview && (
          <p className="text-text-dim text-xs line-clamp-2">{preview}</p>
        )}

        {/* Dropdown menu */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
              }}
            />
            <div className="absolute top-10 right-4 z-20 bg-card border border-[var(--green-08)] rounded-lg shadow-xl py-1 min-w-[140px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit(item);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--green-08)] hover:text-green transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={deleting}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
