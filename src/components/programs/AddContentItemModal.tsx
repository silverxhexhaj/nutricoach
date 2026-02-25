"use client";

import { useState } from "react";
import type { ProgramItemType, ProgramItem } from "@/types/program";
import type { LibraryItem } from "@/types/program";
import {
  ITEM_TYPES,
  WorkoutFields,
  ExerciseFields,
  MealFields,
  VideoFields,
  TextFields,
} from "./ContentItemFields";
import { LibraryItemPicker } from "@/components/library/LibraryItemPicker";

interface AddContentItemModalProps {
  programId: string;
  dayId: string;
  editItem?: ProgramItem | null;
  onClose: () => void;
  onSaved: (item: ProgramItem) => void;
  /** When set, creates an override item instead of a template item */
  clientProgramId?: string;
}

export function AddContentItemModal({
  programId,
  dayId,
  editItem,
  onClose,
  onSaved,
  clientProgramId,
}: AddContentItemModalProps) {
  const isEdit = !!editItem;
  const [step, setStep] = useState<"type" | "source" | "library" | "details">(isEdit ? "details" : "type");
  const [selectedType, setSelectedType] = useState<ProgramItemType>(editItem?.type ?? "workout");
  const [title, setTitle] = useState(editItem?.title ?? "");
  const [content, setContent] = useState<Record<string, unknown>>(
    (editItem?.content as Record<string, unknown>) ?? {}
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSelectType = (type: ProgramItemType) => {
    setSelectedType(type);
    setStep("source");
    if (!isEdit) {
      setContent({});
      setTitle("");
    }
  };

  const handleSelectSource = (source: "new" | "library") => {
    if (source === "new") {
      setStep("details");
    } else {
      setStep("library");
    }
  };

  const handleSelectFromLibrary = (item: LibraryItem) => {
    setTitle(item.title);
    setContent((item.content as Record<string, unknown>) ?? {});
    setStep("details");
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      let res: Response;

      if (clientProgramId && !isEdit) {
        res = await fetch(`/api/programs/${programId}/client-overrides`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientProgramId,
            dayId,
            action: "add",
            type: selectedType,
            title: title.trim(),
            content,
          }),
        });
      } else if (isEdit) {
        res = await fetch(`/api/programs/${programId}/items/${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: selectedType, title: title.trim(), content }),
        });
      } else {
        res = await fetch(`/api/programs/${programId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            program_day_id: dayId,
            type: selectedType,
            title: title.trim(),
            content,
          }),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        return;
      }

      const saved = await res.json();
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-card border border-[var(--green-08)] rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--green-08)]">
          <div className="flex items-center gap-3">
            {step === "details" && !isEdit && (
              <button
                type="button"
                onClick={() => setStep("source")}
                className="p-1 text-text-dim hover:text-green transition-colors"
                aria-label="Back"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
            )}
            {step === "source" && (
              <button
                type="button"
                onClick={() => setStep("type")}
                className="p-1 text-text-dim hover:text-green transition-colors"
                aria-label="Back"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
            )}
            {step === "library" && (
              <button
                type="button"
                onClick={() => setStep("source")}
                className="p-1 text-text-dim hover:text-green transition-colors"
                aria-label="Back"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
            )}
            <h2 className="font-heading font-bold text-base">
              {isEdit
                ? "Edit Content Item"
                : step === "type"
                ? "Add Content"
                : step === "source"
                ? "Create new or from library?"
                : step === "library"
                ? `Choose from ${ITEM_TYPES.find((t) => t.type === selectedType)?.label}`
                : `Add ${ITEM_TYPES.find((t) => t.type === selectedType)?.label}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-dim hover:text-green transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {step === "type" ? (
            <div className="grid grid-cols-1 gap-2">
              {ITEM_TYPES.map(({ type, label, description, icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelectType(type)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-[var(--green-08)] hover:border-green hover:bg-[var(--green-08)] transition-all text-left group"
                >
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="font-medium text-sm group-hover:text-green transition-colors">{label}</p>
                    <p className="text-xs text-text-dim">{description}</p>
                  </div>
                  <svg className="ml-auto text-text-dim group-hover:text-green transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          ) : step === "source" ? (
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleSelectSource("new")}
                className="flex items-center gap-4 p-4 rounded-xl border border-[var(--green-08)] hover:border-green hover:bg-[var(--green-08)] transition-all text-left group"
              >
                <span className="text-2xl">✏️</span>
                <div>
                  <p className="font-medium text-sm group-hover:text-green transition-colors">Create new</p>
                  <p className="text-xs text-text-dim">Add content from scratch</p>
                </div>
                <svg className="ml-auto text-text-dim group-hover:text-green transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSource("library")}
                className="flex items-center gap-4 p-4 rounded-xl border border-[var(--green-08)] hover:border-green hover:bg-[var(--green-08)] transition-all text-left group"
              >
                <span className="text-2xl">📚</span>
                <div>
                  <p className="font-medium text-sm group-hover:text-green transition-colors">From Library</p>
                  <p className="text-xs text-text-dim">Use a reusable item from your library</p>
                </div>
                <svg className="ml-auto text-text-dim group-hover:text-green transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          ) : step === "library" ? (
            <LibraryItemPicker
              type={selectedType}
              onSelect={handleSelectFromLibrary}
              onBack={() => setStep("source")}
            />
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    selectedType === "workout" ? "e.g. Leg Day 1"
                    : selectedType === "exercise" ? "e.g. Stairmaster"
                    : selectedType === "meal" ? "e.g. High Protein Breakfast"
                    : selectedType === "video" ? "e.g. Form Check: Squat"
                    : "e.g. Recovery Notes"
                  }
                  className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-4 py-3 text-sm placeholder:text-text-dim focus:outline-none focus:border-green transition-colors"
                  autoFocus
                />
              </div>

              {/* Type-specific fields */}
              {selectedType === "workout" && (
                <WorkoutFields content={content} onChange={setContent} />
              )}
              {selectedType === "exercise" && (
                <ExerciseFields content={content} onChange={setContent} />
              )}
              {selectedType === "meal" && (
                <MealFields content={content} onChange={setContent} />
              )}
              {selectedType === "video" && (
                <VideoFields content={content} onChange={setContent} />
              )}
              {selectedType === "text" && (
                <TextFields content={content} onChange={setContent} />
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-60"
                >
                  {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Item"}
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
