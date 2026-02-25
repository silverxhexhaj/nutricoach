"use client";

import type { ProgramItemType } from "@/types/program";

export const ITEM_TYPES: { type: ProgramItemType; label: string; description: string; icon: string }[] = [
  { type: "workout", label: "Workout", description: "A session with multiple exercises", icon: "⚡" },
  { type: "exercise", label: "Exercise", description: "A single exercise with sets & reps", icon: "🏋️" },
  { type: "meal", label: "Meal", description: "A meal plan with foods and macros", icon: "🥗" },
  { type: "video", label: "Video", description: "An instructional or motivation video", icon: "▶️" },
  { type: "text", label: "Text", description: "Notes, instructions, or any text content", icon: "📝" },
];

export interface ContentFieldProps {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}

export function WorkoutFields({ content, onChange }: ContentFieldProps) {
  type ExerciseRow = { name: string; sets: string; reps: string; rest: string };
  const exercises: ExerciseRow[] = (content.exercises as ExerciseRow[]) ?? [{ name: "", sets: "", reps: "", rest: "" }];

  const update = (idx: number, field: keyof ExerciseRow, value: string) => {
    const updated = exercises.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex));
    onChange({ ...content, exercises: updated });
  };

  const addRow = () => {
    onChange({ ...content, exercises: [...exercises, { name: "", sets: "", reps: "", rest: "" }] });
  };

  const removeRow = (idx: number) => {
    onChange({ ...content, exercises: exercises.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Exercises</label>
      {exercises.map((ex, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center">
          <input
            type="text"
            value={ex.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="Exercise name"
            className="bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2 text-sm placeholder:text-text-dim focus:outline-none focus:border-green"
          />
          <input type="text" value={ex.sets} onChange={(e) => update(i, "sets", e.target.value)} placeholder="Sets" className="w-14 bg-dark border border-[var(--green-08)] rounded-lg px-2 py-2 text-sm text-center placeholder:text-text-dim focus:outline-none focus:border-green" />
          <input type="text" value={ex.reps} onChange={(e) => update(i, "reps", e.target.value)} placeholder="Reps" className="w-14 bg-dark border border-[var(--green-08)] rounded-lg px-2 py-2 text-sm text-center placeholder:text-text-dim focus:outline-none focus:border-green" />
          <input type="text" value={ex.rest} onChange={(e) => update(i, "rest", e.target.value)} placeholder="Rest" className="w-16 bg-dark border border-[var(--green-08)] rounded-lg px-2 py-2 text-sm text-center placeholder:text-text-dim focus:outline-none focus:border-green" />
          <button type="button" onClick={() => removeRow(i)} className="text-text-dim hover:text-red-400 transition-colors p-1">×</button>
        </div>
      ))}
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 text-[10px] text-text-dim px-0">
        <span></span>
        <span className="w-14 text-center">Sets</span>
        <span className="w-14 text-center">Reps</span>
        <span className="w-16 text-center">Rest</span>
        <span className="w-6"></span>
      </div>
      <button type="button" onClick={addRow} className="text-sm text-green hover:underline">+ Add exercise</button>
      <div>
        <label className="block text-sm font-medium mb-1.5">Notes</label>
        <textarea value={(content.notes as string) ?? ""} onChange={(e) => onChange({ ...content, notes: e.target.value })} placeholder="Optional workout notes..." rows={2} className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2.5 text-sm placeholder:text-text-dim focus:outline-none focus:border-green resize-none" />
      </div>
    </div>
  );
}

export function ExerciseFields({ content, onChange }: ContentFieldProps) {
  const set = (key: string, value: string) => onChange({ ...content, [key]: value });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-dim mb-1">Sets</label>
          <input type="text" value={(content.sets as string) ?? ""} onChange={(e) => set("sets", e.target.value)} placeholder="e.g. 3" className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2 text-sm placeholder:text-text-dim focus:outline-none focus:border-green" />
        </div>
        <div>
          <label className="block text-xs text-text-dim mb-1">Reps</label>
          <input type="text" value={(content.reps as string) ?? ""} onChange={(e) => set("reps", e.target.value)} placeholder="e.g. 8-12" className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2 text-sm placeholder:text-text-dim focus:outline-none focus:border-green" />
        </div>
        <div>
          <label className="block text-xs text-text-dim mb-1">Weight</label>
          <input type="text" value={(content.weight as string) ?? ""} onChange={(e) => set("weight", e.target.value)} placeholder="e.g. 60kg or bodyweight" className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2 text-sm placeholder:text-text-dim focus:outline-none focus:border-green" />
        </div>
        <div>
          <label className="block text-xs text-text-dim mb-1">Rest (seconds)</label>
          <input type="number" value={(content.rest_seconds as string) ?? ""} onChange={(e) => set("rest_seconds", e.target.value)} placeholder="e.g. 90" className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2 text-sm placeholder:text-text-dim focus:outline-none focus:border-green" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-text-dim mb-1">Video URL</label>
        <input type="url" value={(content.video_url as string) ?? ""} onChange={(e) => set("video_url", e.target.value)} placeholder="https://youtube.com/..." className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2 text-sm placeholder:text-text-dim focus:outline-none focus:border-green" />
      </div>
      <div>
        <label className="block text-xs text-text-dim mb-1">Notes</label>
        <textarea value={(content.notes as string) ?? ""} onChange={(e) => set("notes", e.target.value)} placeholder="Form cues, tips..." rows={2} className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2.5 text-sm placeholder:text-text-dim focus:outline-none focus:border-green resize-none" />
      </div>
    </div>
  );
}

export function MealFields({ content, onChange }: ContentFieldProps) {
  type FoodRow = { name: string; amount: string; unit: string; calories: string; protein: string };
  const foods: FoodRow[] = (content.foods as FoodRow[]) ?? [{ name: "", amount: "", unit: "g", calories: "", protein: "" }];
  const mealType = (content.meal_type as string) ?? "";

  const updateFood = (idx: number, field: keyof FoodRow, value: string) => {
    const updated = foods.map((f, i) => (i === idx ? { ...f, [field]: value } : f));
    onChange({ ...content, foods: updated });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-text-dim mb-1">Meal Type</label>
        <select value={mealType} onChange={(e) => onChange({ ...content, meal_type: e.target.value })} className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green cursor-pointer">
          <option value="">Not specified</option>
          {["Breakfast", "Lunch", "Dinner", "Snack", "Pre-workout", "Post-workout"].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <label className="block text-sm font-medium">Foods</label>
      {foods.map((food, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 items-center">
          <input type="text" value={food.name} onChange={(e) => updateFood(i, "name", e.target.value)} placeholder="Food name" className="bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2 text-sm placeholder:text-text-dim focus:outline-none focus:border-green" />
          <input type="text" value={food.amount} onChange={(e) => updateFood(i, "amount", e.target.value)} placeholder="Amt" className="w-14 bg-dark border border-[var(--green-08)] rounded-lg px-2 py-2 text-sm text-center placeholder:text-text-dim focus:outline-none focus:border-green" />
          <input type="text" value={food.unit} onChange={(e) => updateFood(i, "unit", e.target.value)} placeholder="Unit" className="w-14 bg-dark border border-[var(--green-08)] rounded-lg px-2 py-2 text-sm text-center placeholder:text-text-dim focus:outline-none focus:border-green" />
          <input type="text" value={food.calories} onChange={(e) => updateFood(i, "calories", e.target.value)} placeholder="kcal" className="w-14 bg-dark border border-[var(--green-08)] rounded-lg px-2 py-2 text-sm text-center placeholder:text-text-dim focus:outline-none focus:border-green" />
          <input type="text" value={food.protein} onChange={(e) => updateFood(i, "protein", e.target.value)} placeholder="pro" className="w-14 bg-dark border border-[var(--green-08)] rounded-lg px-2 py-2 text-sm text-center placeholder:text-text-dim focus:outline-none focus:border-green" />
          <button type="button" onClick={() => onChange({ ...content, foods: foods.filter((_, j) => j !== i) })} className="text-text-dim hover:text-red-400 transition-colors p-1">×</button>
        </div>
      ))}
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 text-[10px] text-text-dim">
        <span></span>
        <span className="w-14 text-center">Amt</span>
        <span className="w-14 text-center">Unit</span>
        <span className="w-14 text-center">kcal</span>
        <span className="w-14 text-center">Prot</span>
        <span className="w-6"></span>
      </div>
      <button type="button" onClick={() => onChange({ ...content, foods: [...foods, { name: "", amount: "", unit: "g", calories: "", protein: "" }] })} className="text-sm text-green hover:underline">+ Add food</button>
    </div>
  );
}

export function VideoFields({ content, onChange }: ContentFieldProps) {
  const set = (key: string, value: string) => onChange({ ...content, [key]: value });
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-text-dim mb-1">Video URL <span className="text-red-400">*</span></label>
        <input type="url" value={(content.url as string) ?? ""} onChange={(e) => set("url", e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2 text-sm placeholder:text-text-dim focus:outline-none focus:border-green" />
      </div>
      <div>
        <label className="block text-xs text-text-dim mb-1">Notes</label>
        <textarea value={(content.notes as string) ?? ""} onChange={(e) => set("notes", e.target.value)} placeholder="Context or instructions for this video..." rows={2} className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2.5 text-sm placeholder:text-text-dim focus:outline-none focus:border-green resize-none" />
      </div>
    </div>
  );
}

export function TextFields({ content, onChange }: ContentFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">Content</label>
      <textarea
        value={(content.body as string) ?? ""}
        onChange={(e) => onChange({ ...content, body: e.target.value })}
        placeholder="Write your text content here..."
        rows={6}
        className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2.5 text-sm placeholder:text-text-dim focus:outline-none focus:border-green resize-none"
      />
    </div>
  );
}
