"use client";

import { useEffect, useState } from "react";
import type { LibraryItem, ProgramItemType } from "@/types/program";
import { ITEM_TYPES } from "@/components/programs/ContentItemFields";

interface LibraryItemPickerProps {
  type: ProgramItemType;
  onSelect: (item: LibraryItem) => void;
  onBack: () => void;
}

export function LibraryItemPicker({ type, onSelect, onBack }: LibraryItemPickerProps) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchItems() {
      setLoading(true);
      try {
        const res = await fetch(`/api/library?type=${encodeURIComponent(type)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setItems(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchItems();
    return () => {
      cancelled = true;
    };
  }, [type]);

  const typeInfo = ITEM_TYPES.find((t) => t.type === type);

  if (loading) {
    return (
      <div className="py-8 text-center text-text-dim text-sm">
        Loading library...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-text-dim text-sm text-center py-4">
          No {typeInfo?.label?.toLowerCase() ?? type} items in your library yet. Create one from the Library page first.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 text-sm text-green hover:underline"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[320px] overflow-y-auto">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item)}
          className="w-full flex items-center gap-3 p-4 rounded-xl border border-[var(--green-08)] hover:border-green hover:bg-[var(--green-08)] transition-all text-left"
        >
          <span className="text-xl">{typeInfo?.icon ?? "📄"}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{item.title}</p>
            {item.type === "text" && item.content && typeof item.content === "object" && "body" in item.content && (
              <p className="text-xs text-text-dim truncate">
                {String((item.content as { body?: string }).body ?? "").slice(0, 60)}
                {String((item.content as { body?: string }).body ?? "").length > 60 ? "…" : ""}
              </p>
            )}
          </div>
          <svg className="shrink-0 text-text-dim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      ))}
      <button
        type="button"
        onClick={onBack}
        className="w-full py-2.5 text-sm text-text-dim hover:text-green transition-colors"
      >
        ← Create new instead
      </button>
    </div>
  );
}
