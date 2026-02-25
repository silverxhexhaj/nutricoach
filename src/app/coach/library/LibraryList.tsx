"use client";

import { useState } from "react";
import type { LibraryItem } from "@/types/program";
import { LibraryItemCard } from "@/components/library/LibraryItemCard";
import { LibraryItemModal } from "@/components/library/LibraryItemModal";
import { LibraryFilters } from "@/components/library/LibraryFilters";

interface LibraryListProps {
  initialItems: LibraryItem[];
}

export function LibraryList({ initialItems }: LibraryListProps) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modalItem, setModalItem] = useState<LibraryItem | null | undefined>(undefined);

  const filtered = items.filter((item) => {
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || item.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleSaved = (saved: LibraryItem) => {
    if (modalItem && "id" in modalItem && modalItem.id) {
      setItems((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
    } else {
      setItems((prev) => [saved, ...prev]);
    }
    setModalItem(undefined);
  };

  const handleDeleted = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-2xl mb-1">Library</h1>
          <p className="text-text-dim text-sm">
            Create reusable content to add to your programs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalItem(null)}
          className="btn-primary px-5 py-2.5 text-sm font-semibold rounded-lg"
        >
          + Add to Library
        </button>
      </div>

      <div className="mb-6">
        <LibraryFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-text-dim">
          {items.length === 0 ? (
            <div>
              <p className="text-lg font-heading font-bold mb-2">No library items yet</p>
              <p className="text-sm mb-6">Create reusable workouts, exercises, meals, videos, or text to use across your programs.</p>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="btn-primary px-5 py-2.5 text-sm font-semibold rounded-lg"
              >
                + Add to Library
              </button>
            </div>
          ) : (
            <p>No items match your filters.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <LibraryItemCard
              key={item.id}
              item={item}
              onEdit={setModalItem}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {modalItem !== undefined && (
        <LibraryItemModal
          editItem={modalItem}
          onClose={() => setModalItem(undefined)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
