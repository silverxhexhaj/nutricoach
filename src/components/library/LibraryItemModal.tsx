"use client";

import { useState } from "react";
import type { ProgramItemType, LibraryItem } from "@/types/program";
import {
  ITEM_TYPES,
  WorkoutFields,
  ExerciseFields,
  MealFields,
  VideoFields,
  TextFields,
} from "@/components/programs/ContentItemFields";

interface LibraryItemModalProps {
  editItem?: LibraryItem | null;
  onClose: () => void;
  onSaved: (item: LibraryItem) => void;
}

type Step = "type" | "method" | "ai-prompt" | "details";

const AI_SUPPORTED_TYPES: ProgramItemType[] = ["workout", "exercise", "meal", "text"];

const AI_PLACEHOLDERS: Record<ProgramItemType, string> = {
  workout:
    "e.g. Upper body push day for intermediate lifters, 5 exercises, hypertrophy focus with compound movements",
  exercise:
    "e.g. Romanian deadlift for hamstring development, intermediate level, proper form cues included",
  meal: "e.g. High protein post-workout breakfast with eggs and oats, around 600 calories",
  text: "e.g. A beginner's guide to progressive overload — explain the concept and provide a 4-week example",
  video: "",
};

export function LibraryItemModal({
  editItem,
  onClose,
  onSaved,
}: LibraryItemModalProps) {
  const isEdit = !!editItem;
  const [step, setStep] = useState<Step>(isEdit ? "details" : "type");
  const [selectedType, setSelectedType] = useState<ProgramItemType>(editItem?.type ?? "workout");
  const [title, setTitle] = useState(editItem?.title ?? "");
  const [content, setContent] = useState<Record<string, unknown>>(
    (editItem?.content as Record<string, unknown>) ?? {}
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // AI generation state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const handleSelectType = (type: ProgramItemType) => {
    setSelectedType(type);
    setError("");
    setAiError("");
    setAiPrompt("");
    if (!isEdit) {
      setContent({});
      setTitle("");
    }
    // Video goes straight to manual; others get method choice
    if (type === "video") {
      setStep("details");
    } else {
      setStep("method");
    }
  };

  const handleMethodManual = () => {
    setStep("details");
  };

  const handleMethodAI = () => {
    setAiError("");
    setStep("ai-prompt");
  };

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) {
      setAiError("Please describe what you want to generate.");
      return;
    }
    setAiLoading(true);
    setAiError("");

    try {
      const res = await fetch("/api/library/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, prompt: aiPrompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAiError(data.error ?? "Generation failed. Please try again.");
        return;
      }

      setTitle(data.title ?? "");
      setContent(data.content ?? {});
      setStep("details");
    } catch {
      setAiError("Network error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleBackFromDetails = () => {
    if (isEdit) return;
    if (selectedType === "video") {
      setStep("type");
    } else {
      setStep("method");
    }
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
      if (isEdit) {
        res = await fetch(`/api/library/${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: selectedType, title: title.trim(), content }),
        });
      } else {
        res = await fetch("/api/library", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: selectedType, title: title.trim(), content }),
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

  const typeLabel = ITEM_TYPES.find((t) => t.type === selectedType)?.label ?? "";

  const modalTitle = isEdit
    ? "Edit Library Item"
    : step === "type"
    ? "Add to Library"
    : step === "method"
    ? `Add ${typeLabel}`
    : step === "ai-prompt"
    ? `Generate ${typeLabel} with AI`
    : `Add ${typeLabel}`;

  const showBackButton =
    !isEdit &&
    (step === "method" || step === "ai-prompt" || step === "details");

  const handleBack = () => {
    if (step === "method") setStep("type");
    else if (step === "ai-prompt") setStep("method");
    else if (step === "details") handleBackFromDetails();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-card border border-[var(--green-08)] rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--green-08)]">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                type="button"
                onClick={handleBack}
                className="p-1 text-text-dim hover:text-green transition-colors"
                aria-label="Back"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
            )}
            <h2 className="font-heading font-bold text-base">{modalTitle}</h2>
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
          {/* Step: Type selection */}
          {step === "type" && (
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
          )}

          {/* Step: Method selection (Manual vs AI) */}
          {step === "method" && (
            <div className="space-y-3">
              <p className="text-sm text-text-dim mb-4">How would you like to create this {typeLabel.toLowerCase()}?</p>

              <button
                type="button"
                onClick={handleMethodManual}
                className="flex items-center gap-4 w-full p-4 rounded-xl border border-[var(--green-08)] hover:border-green hover:bg-[var(--green-08)] transition-all text-left group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--green-08)] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-green">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm group-hover:text-green transition-colors">Create Manually</p>
                  <p className="text-xs text-text-dim mt-0.5">Fill in the details yourself</p>
                </div>
                <svg className="ml-auto text-text-dim group-hover:text-green transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {AI_SUPPORTED_TYPES.includes(selectedType) && (
                <button
                  type="button"
                  onClick={handleMethodAI}
                  className="flex items-center gap-4 w-full p-4 rounded-xl border border-green/40 hover:border-green bg-green/5 hover:bg-green/10 transition-all text-left group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green/10 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-green">
                      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-green">Generate with AI</p>
                    <p className="text-xs text-text-dim mt-0.5">Describe what you want — AI fills it in</p>
                  </div>
                  <svg className="ml-auto text-green/60 group-hover:text-green transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Step: AI prompt input */}
          {step === "ai-prompt" && (
            <div className="space-y-4">
              {aiError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                  {aiError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Describe your {typeLabel.toLowerCase()}
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={AI_PLACEHOLDERS[selectedType]}
                  rows={4}
                  autoFocus
                  className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-4 py-3 text-sm placeholder:text-text-dim focus:outline-none focus:border-green transition-colors resize-none"
                />
                <p className="text-xs text-text-dim mt-1.5">
                  Be specific — include goal, level, focus area, or any constraints.
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="btn-primary flex-1 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {aiLoading ? (
                    <>
                      <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
                      </svg>
                      Generate
                    </>
                  )}
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

          {/* Step: Details form */}
          {step === "details" && (
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

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-60"
                >
                  {saving ? "Saving..." : isEdit ? "Save Changes" : "Add to Library"}
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
