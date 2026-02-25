"use client";

import { useMemo, useState } from "react";
import type { ClientLibraryItem, ClientLibrarySource } from "@/types/program";
import { ClientLibraryItemCard } from "@/components/library/ClientLibraryItemCard";
import { ClientLibraryModal } from "@/components/library/ClientLibraryModal";

interface ClientLibraryListProps {
  initialItems: ClientLibraryItem[];
}

type SourceFilter = "all" | ClientLibrarySource;

const SOURCE_TABS: { id: SourceFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "platform", label: "Platform" },
  { id: "coach", label: "Coach" },
  { id: "personal", label: "Mine" },
];

const TYPE_LABELS: Record<string, string> = {
  workout: "Workout",
  exercise: "Exercise",
  meal: "Meal",
  video: "Video",
  text: "Text",
  note: "Note",
  bookmark: "Bookmark",
  recipe: "Recipe",
};

function getEmptyMessage(sourceFilter: SourceFilter, hasItems: boolean) {
  if (!hasItems) {
    return {
      title: "No library content yet",
      description:
        "You will see platform resources, your coach's resources, and your own saved notes here.",
    };
  }
  if (sourceFilter === "platform") {
    return {
      title: "No platform resources found",
      description: "Try a different search or check back later for new platform content.",
    };
  }
  if (sourceFilter === "coach") {
    return {
      title: "No coach resources found",
      description: "Your coach has not shared content yet. Ask them to add resources for you.",
    };
  }
  if (sourceFilter === "personal") {
    return {
      title: "No personal content found",
      description: "Add your own notes, bookmarks, recipes, and workout logs to build your library.",
    };
  }
  return {
    title: "No matching content",
    description: "Adjust your search or filters to find what you need.",
  };
}

export function ClientLibraryList({ initialItems }: ClientLibraryListProps) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);

  const typeOptions = useMemo(() => {
    const values = Array.from(new Set(items.map((item) => item.type))).sort();
    return values.map((value) => ({
      value,
      label: TYPE_LABELS[value] ?? value,
    }));
  }, [items]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesSearch =
          !search ||
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          JSON.stringify(item.content ?? {})
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesType = !typeFilter || item.type === typeFilter;
        const matchesSource = sourceFilter === "all" || item.source === sourceFilter;
        return matchesSearch && matchesType && matchesSource;
      }),
    [items, search, typeFilter, sourceFilter]
  );

  const emptyState = getEmptyMessage(sourceFilter, items.length > 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-2xl mb-1">Library</h1>
          <p className="text-text-dim text-sm">
            Explore platform and coach resources, and save your own content.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-primary px-5 py-2.5 text-sm font-semibold rounded-lg"
        >
          + Add Note
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or content..."
            className="w-full bg-card border border-[var(--green-08)] rounded-lg pl-9 pr-4 py-2.5 text-sm placeholder:text-text-dim focus:outline-none focus:border-green transition-colors"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-card border border-[var(--green-08)] rounded-lg px-3 py-2.5 text-sm text-text-dim focus:outline-none focus:border-green transition-colors cursor-pointer"
        >
          <option value="">All types</option>
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {SOURCE_TABS.map((tab) => {
          const active = sourceFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSourceFilter(tab.id)}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-green bg-[var(--green-10)] text-green"
                  : "border-[var(--green-08)] text-text-dim hover:text-green"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-[var(--green-08)] bg-card p-10 text-center">
          <h2 className="font-heading font-bold text-lg mb-2">{emptyState.title}</h2>
          <p className="text-sm text-text-dim max-w-xl mx-auto">{emptyState.description}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <ClientLibraryItemCard
              key={item.id}
              item={item}
              onDeleted={(id) => setItems((prev) => prev.filter((entry) => entry.id !== id))}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <ClientLibraryModal
          onClose={() => setModalOpen(false)}
          onSaved={(saved) => {
            setItems((prev) => [saved, ...prev]);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
