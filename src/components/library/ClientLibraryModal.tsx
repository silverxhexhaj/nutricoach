"use client";

import { useState } from "react";
import type { ClientLibraryItem } from "@/types/program";

type PersonalType = "note" | "bookmark" | "recipe" | "workout";

interface ClientLibraryModalProps {
  onClose: () => void;
  onSaved: (item: ClientLibraryItem) => void;
}

const PERSONAL_TYPES: {
  type: PersonalType;
  label: string;
  description: string;
  icon: string;
}[] = [
  { type: "note", label: "Note", description: "Personal notes and reminders", icon: "🗒️" },
  { type: "bookmark", label: "Bookmark", description: "Save useful links", icon: "🔖" },
  { type: "recipe", label: "Recipe", description: "Your own meal ideas", icon: "🍲" },
  { type: "workout", label: "Workout Log", description: "Save a simple workout", icon: "⚡" },
];

export function ClientLibraryModal({ onClose, onSaved }: ClientLibraryModalProps) {
  const [step, setStep] = useState<"type" | "details">("type");
  const [selectedType, setSelectedType] = useState<PersonalType>("note");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveItem = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/client-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          title: title.trim(),
          content,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        return;
      }

      const saved = (await res.json()) as ClientLibraryItem;
      onSaved(saved);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border border-[var(--green-08)] rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--green-08)]">
          <div className="flex items-center gap-3">
            {step === "details" && (
              <button
                type="button"
                onClick={() => setStep("type")}
                className="p-1 text-text-dim hover:text-green transition-colors"
                aria-label="Back"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
            )}
            <h2 className="font-heading font-bold text-base">
              {step === "type"
                ? "Add to My Library"
                : `Add ${PERSONAL_TYPES.find((entry) => entry.type === selectedType)?.label}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-dim hover:text-green transition-colors"
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {step === "type" ? (
            <div className="grid grid-cols-1 gap-2">
              {PERSONAL_TYPES.map(({ type, label, description, icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setSelectedType(type);
                    setTitle("");
                    setContent({});
                    setError("");
                    setStep("details");
                  }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-[var(--green-08)] hover:border-green hover:bg-[var(--green-08)] transition-all text-left group"
                >
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="font-medium text-sm group-hover:text-green transition-colors">{label}</p>
                    <p className="text-xs text-text-dim">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give this item a clear title"
                  className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-4 py-3 text-sm placeholder:text-text-dim focus:outline-none focus:border-green transition-colors"
                  autoFocus
                />
              </div>

              {selectedType === "note" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Note</label>
                  <textarea
                    value={(content.body as string) ?? ""}
                    onChange={(e) => setContent({ ...content, body: e.target.value })}
                    rows={6}
                    placeholder="Write your note..."
                    className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-4 py-3 text-sm placeholder:text-text-dim focus:outline-none focus:border-green resize-none"
                  />
                </div>
              )}

              {selectedType === "bookmark" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={(content.url as string) ?? ""}
                      onChange={(e) => setContent({ ...content, url: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-4 py-3 text-sm placeholder:text-text-dim focus:outline-none focus:border-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Description</label>
                    <textarea
                      value={(content.description as string) ?? ""}
                      onChange={(e) => setContent({ ...content, description: e.target.value })}
                      rows={3}
                      placeholder="Optional context for this link..."
                      className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-4 py-3 text-sm placeholder:text-text-dim focus:outline-none focus:border-green resize-none"
                    />
                  </div>
                </>
              )}

              {selectedType === "recipe" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Ingredients</label>
                    <textarea
                      value={Array.isArray(content.ingredients) ? content.ingredients.join("\n") : ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          ingredients: e.target.value
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(Boolean),
                        })
                      }
                      rows={4}
                      placeholder="1 cup oats&#10;1 banana&#10;1 scoop protein"
                      className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-4 py-3 text-sm placeholder:text-text-dim focus:outline-none focus:border-green resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Instructions</label>
                    <textarea
                      value={(content.instructions as string) ?? ""}
                      onChange={(e) => setContent({ ...content, instructions: e.target.value })}
                      rows={4}
                      placeholder="How to prepare this recipe..."
                      className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-4 py-3 text-sm placeholder:text-text-dim focus:outline-none focus:border-green resize-none"
                    />
                  </div>
                </>
              )}

              {selectedType === "workout" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Exercises</label>
                    <textarea
                      value={Array.isArray(content.exercises) ? content.exercises.join("\n") : ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          exercises: e.target.value
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(Boolean),
                        })
                      }
                      rows={5}
                      placeholder="Squat - 4x8&#10;Bench Press - 4x6"
                      className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-4 py-3 text-sm placeholder:text-text-dim focus:outline-none focus:border-green resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Notes</label>
                    <textarea
                      value={(content.notes as string) ?? ""}
                      onChange={(e) => setContent({ ...content, notes: e.target.value })}
                      rows={3}
                      placeholder="Optional workout notes..."
                      className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-4 py-3 text-sm placeholder:text-text-dim focus:outline-none focus:border-green resize-none"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={saveItem}
                  disabled={saving}
                  className="btn-primary flex-1 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save to My Library"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm text-text-dim hover:text-green transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
