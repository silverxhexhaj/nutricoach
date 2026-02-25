"use client";

import { useMemo, useState } from "react";
import type { ClientLibraryItem } from "@/types/program";

interface ClientLibraryItemCardProps {
  item: ClientLibraryItem;
  onDeleted: (id: string) => void;
}

const TYPE_ICONS: Record<string, string> = {
  workout: "⚡",
  exercise: "🏋️",
  meal: "🥗",
  video: "▶️",
  text: "📝",
  note: "🗒️",
  bookmark: "🔖",
  recipe: "🍲",
};

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

const SOURCE_META: Record<
  ClientLibraryItem["source"],
  { label: string; className: string }
> = {
  platform: {
    label: "Platform",
    className: "bg-[var(--green-10)] border-[var(--green-20)] text-green",
  },
  coach: {
    label: "Coach",
    className: "bg-blue-500/10 border-blue-500/30 text-blue-300",
  },
  personal: {
    label: "Mine",
    className: "bg-purple-500/10 border-purple-500/30 text-purple-300",
  },
};

function getPrimarySnippet(item: ClientLibraryItem): string {
  const content = item.content ?? {};

  if (item.type === "text" || item.type === "note") {
    const body = typeof content.body === "string" ? content.body : "";
    if (body) return body.slice(0, 110) + (body.length > 110 ? "..." : "");
  }

  if (item.type === "bookmark") {
    const url = typeof content.url === "string" ? content.url : "";
    const description = typeof content.description === "string" ? content.description : "";
    return description || url;
  }

  if (item.type === "video") {
    const url = typeof content.url === "string" ? content.url : "";
    return url;
  }

  if (item.type === "workout") {
    const exercises = Array.isArray(content.exercises) ? content.exercises : [];
    return exercises.length > 0
      ? `${exercises.length} exercise${exercises.length > 1 ? "s" : ""}`
      : "No exercises added";
  }

  if (item.type === "recipe" || item.type === "meal") {
    const foods = Array.isArray(content.foods)
      ? content.foods
      : Array.isArray(content.ingredients)
      ? content.ingredients
      : [];
    return foods.length > 0 ? `${foods.length} item${foods.length > 1 ? "s" : ""}` : "No ingredients listed";
  }

  return "";
}

export function ClientLibraryItemCard({ item, onDeleted }: ClientLibraryItemCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const source = SOURCE_META[item.source];
  const preview = useMemo(() => getPrimarySnippet(item), [item]);

  const handleDelete = async () => {
    if (item.source !== "personal") return;
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/client-library/${item.id}`, { method: "DELETE" });
      if (res.ok) onDeleted(item.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="rounded-xl border border-[var(--green-08)] bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-4 hover:bg-[var(--green-04)] transition-colors"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0" aria-hidden>
              {TYPE_ICONS[item.type] ?? "📄"}
            </span>
            <h3 className="font-heading font-bold text-sm truncate">{item.title}</h3>
          </div>
          <span
            className={`shrink-0 inline-flex items-center rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide ${source.className}`}
          >
            {source.label}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase text-text-dim">{TYPE_LABELS[item.type] ?? item.type}</p>
          <svg
            className={`text-text-dim transition-transform ${expanded ? "rotate-180" : ""}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {preview && <p className="text-sm text-text-dim mt-2 line-clamp-2">{preview}</p>}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[var(--green-08)]">
          <div className="pt-3 space-y-2 text-sm text-text-dim">
            {(item.type === "text" || item.type === "note") &&
              typeof item.content?.body === "string" && (
                <p className="whitespace-pre-wrap">{item.content.body}</p>
              )}

            {item.type === "bookmark" && (
              <div className="space-y-1">
                {typeof item.content?.url === "string" && (
                  <a
                    href={item.content.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green hover:underline break-all"
                  >
                    {item.content.url}
                  </a>
                )}
                {typeof item.content?.description === "string" && <p>{item.content.description}</p>}
              </div>
            )}

            {item.type === "video" && typeof item.content?.url === "string" && (
              <a
                href={item.content.url}
                target="_blank"
                rel="noreferrer"
                className="text-green hover:underline break-all"
              >
                {item.content.url}
              </a>
            )}

            {(item.type === "recipe" || item.type === "meal") &&
              (Array.isArray(item.content?.ingredients) || Array.isArray(item.content?.foods)) && (
                <ul className="list-disc pl-5 space-y-1">
                  {(
                    (Array.isArray(item.content?.ingredients)
                      ? item.content.ingredients
                      : item.content?.foods ?? []) as unknown[]
                  )
                    .slice(0, 6)
                    .map((entry, idx) => (
                      <li key={idx}>
                        {typeof entry === "string"
                          ? entry
                          : typeof entry === "object" && entry !== null && "name" in entry
                          ? String(entry.name)
                          : "Item"}
                      </li>
                    ))}
                </ul>
              )}

            {item.type === "workout" && Array.isArray(item.content?.exercises) && (
              <ul className="list-disc pl-5 space-y-1">
                {item.content.exercises.slice(0, 6).map((entry, idx) => (
                  <li key={idx}>
                    {typeof entry === "string"
                      ? entry
                      : typeof entry === "object" && entry !== null && "name" in entry
                      ? String(entry.name)
                      : "Exercise"}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {item.source === "personal" && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm text-red-400 hover:text-red-300 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
