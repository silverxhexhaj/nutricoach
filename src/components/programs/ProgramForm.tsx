"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Program } from "@/types/program";

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DIFFICULTY_LABELS: Record<number, string> = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };
const PRESET_COLORS = ["#B8F04A", "#4AF0A8", "#4AB8F0", "#F04A4A", "#F0A84A", "#A84AF0", "#F04AB8"];

interface ProgramFormProps {
  program?: Program;
  onSaved?: (program: Program) => void;
  onCancel?: () => void;
}

export function ProgramForm({ program, onSaved, onCancel }: ProgramFormProps) {
  const router = useRouter();
  const isEdit = !!program;

  const [name, setName] = useState(program?.name ?? "");
  const [description, setDescription] = useState(program?.description ?? "");
  const [tags, setTags] = useState<string[]>(program?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(program?.difficulty ?? 1);
  const [daysPerWeek, setDaysPerWeek] = useState<string>(
    program?.days_per_week ? String(program.days_per_week) : ""
  );
  const [durationWeeks, setDurationWeeks] = useState<string>(
    program?.duration_weeks ? String(program.duration_weeks) : "1"
  );
  const [startDay, setStartDay] = useState(program?.start_day ?? "monday");
  const [color, setColor] = useState(program?.color ?? "#B8F04A");
  const [customColor, setCustomColor] = useState(
    PRESET_COLORS.includes(program?.color ?? "") ? "" : (program?.color ?? "")
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Program name is required.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      tags,
      difficulty,
      days_per_week: daysPerWeek ? parseInt(daysPerWeek) : null,
      duration_weeks: parseInt(durationWeeks) || 1,
      start_day: startDay,
      color: customColor || color,
    };

    try {
      let res: Response;
      if (isEdit) {
        res = await fetch(`/api/programs/${program.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/programs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        return;
      }

      const saved = await res.json();
      if (onSaved) {
        onSaved(saved);
      } else if (!isEdit) {
        router.push(`/coach/programs/${saved.id}`);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Program Name <span className="text-red-400">*</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bodybuilding Show Prep Phase 2"
          className="w-full bg-card border border-[var(--green-08)] rounded-lg px-4 py-3 text-sm placeholder:text-text-dim focus:outline-none focus:border-green transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the program goals, who it's for, what to expect..."
          rows={4}
          className="w-full bg-card border border-[var(--green-08)] rounded-lg px-4 py-3 text-sm placeholder:text-text-dim focus:outline-none focus:border-green transition-colors resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Tags</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add a tag..."
            className="flex-1 bg-card border border-[var(--green-08)] rounded-lg px-4 py-2.5 text-sm placeholder:text-text-dim focus:outline-none focus:border-green transition-colors"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2.5 bg-[var(--green-10)] text-green rounded-lg text-sm font-medium hover:bg-[var(--green-20)] transition-colors"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--green-08)] text-green"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-white transition-colors leading-none"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Row: Difficulty + Duration + Days/Week */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Difficulty</label>
          <div className="flex gap-3">
            {([1, 2, 3] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setDifficulty(lvl)}
                title={DIFFICULTY_LABELS[lvl]}
                className={`w-8 h-8 rounded-full border-2 transition-colors ${
                  difficulty >= lvl
                    ? "bg-green border-green"
                    : "bg-transparent border-[var(--green-20)]"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-text-dim mt-1">{DIFFICULTY_LABELS[difficulty]}</p>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Duration (weeks)</label>
          <select
            value={durationWeeks}
            onChange={(e) => setDurationWeeks(e.target.value)}
            disabled={isEdit}
            className="w-full bg-card border border-[var(--green-08)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green transition-colors cursor-pointer disabled:opacity-50"
          >
            {[1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24].map((w) => (
              <option key={w} value={w}>{w} week{w > 1 ? "s" : ""}</option>
            ))}
          </select>
          {isEdit && (
            <p className="text-xs text-text-dim mt-1">Cannot change duration after creation.</p>
          )}
        </div>

        {/* Days per week */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Days / Week</label>
          <select
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(e.target.value)}
            className="w-full bg-card border border-[var(--green-08)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green transition-colors cursor-pointer"
          >
            <option value="">Not specified</option>
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row: Start Day + Color */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start day */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Start Program On</label>
          <select
            value={startDay}
            onChange={(e) => setStartDay(e.target.value)}
            className="w-full bg-card border border-[var(--green-08)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green transition-colors cursor-pointer capitalize"
          >
            {WEEKDAYS.map((day) => (
              <option key={day} value={day} className="capitalize">{day.charAt(0).toUpperCase() + day.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Assign Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setColor(c); setCustomColor(""); }}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  (customColor || color) === c ? "border-white scale-110" : "border-transparent"
                }`}
                style={{ background: c }}
                aria-label={`Color ${c}`}
              />
            ))}
            <input
              type="color"
              value={customColor || color}
              onChange={(e) => { setCustomColor(e.target.value); setColor(""); }}
              className="w-7 h-7 rounded-full cursor-pointer border border-[var(--green-08)] bg-transparent"
              title="Custom color"
            />
          </div>
          <div
            className="mt-2 h-2 rounded-full"
            style={{ background: customColor || color }}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Program"}
        </button>
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.back())}
          className="px-4 py-2.5 text-sm text-text-dim hover:text-green transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
