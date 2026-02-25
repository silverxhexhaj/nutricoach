"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChipGroup } from "@/components/onboarding/ChipGroup";
import { updateClientProfile } from "@/app/app/profile/actions";

const GOAL_OPTIONS = [
  { value: "Muscle Building", label: "Muscle Building" },
  { value: "Fat Loss", label: "Fat Loss" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Endurance", label: "Endurance" },
];

const TRAINING_DAYS = [
  { value: "2", label: "2 days/week" },
  { value: "3", label: "3 days/week" },
  { value: "4", label: "4 days/week" },
  { value: "5", label: "5 days/week" },
  { value: "6", label: "6 days/week" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary" },
  { value: "lightly active", label: "Lightly Active" },
  { value: "moderately active", label: "Moderately Active" },
  { value: "very active", label: "Very Active" },
];

const DIET_OPTIONS = [
  { value: "none", label: "None" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-Free" },
  { value: "dairy-free", label: "Dairy-Free" },
  { value: "halal", label: "Halal" },
];

const SUPPLEMENT_OPTIONS = [
  { value: "standard", label: "Standard supplements (whey, creatine, etc.)" },
  { value: "herbalife", label: "Include Herbalife products" },
  { value: "mixed", label: "Mix of both" },
];

interface ClientProfileFormProps {
  initialProfile: {
    weight_kg: number | null;
    height_cm: number | null;
    age: number | null;
    goal: string | null;
    activity_level: string | null;
    training_days: number | null;
    dietary_restrictions: string[] | null;
    available_foods: string | null;
    supplements: string | null;
    herbalife_products: string[] | null;
    other_supplements: string[] | null;
  };
}

export function ClientProfileForm({ initialProfile }: ClientProfileFormProps) {
  const [weight, setWeight] = useState(
    initialProfile.weight_kg?.toString() ?? ""
  );
  const [height, setHeight] = useState(
    initialProfile.height_cm?.toString() ?? ""
  );
  const [age, setAge] = useState(initialProfile.age?.toString() ?? "");
  const [goal, setGoal] = useState(initialProfile.goal ?? "Muscle Building");
  const [activityLevel, setActivityLevel] = useState(
    initialProfile.activity_level ?? "moderately active"
  );
  const [trainingDays, setTrainingDays] = useState(
    initialProfile.training_days?.toString() ?? "3"
  );
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(
    initialProfile.dietary_restrictions?.length
      ? initialProfile.dietary_restrictions
      : ["none"]
  );
  const [availableFoods, setAvailableFoods] = useState(
    initialProfile.available_foods ?? ""
  );
  const [supplements, setSupplements] = useState(
    initialProfile.supplements ?? "standard"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const hasCoachSupplements =
    (initialProfile.herbalife_products?.filter(Boolean).length ?? 0) > 0 ||
    (initialProfile.other_supplements?.filter(Boolean).length ?? 0) > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("weight_kg", weight);
      formData.set("height_cm", height);
      formData.set("age", age);
      formData.set("goal", goal);
      formData.set("activity_level", activityLevel);
      formData.set("training_days", trainingDays);
      formData.set("dietary_restrictions", dietaryRestrictions.join(","));
      formData.set("available_foods", availableFoods);
      formData.set("supplements", supplements);

      const result = await updateClientProfile(formData);
      if (result.error) throw new Error(result.error);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">WEIGHT (kg)</label>
          <input
            type="number"
            className="form-input"
            placeholder="80"
            min={40}
            max={200}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">HEIGHT (cm)</label>
          <input
            type="number"
            className="form-input"
            placeholder="180"
            min={140}
            max={220}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">AGE</label>
          <input
            type="number"
            className="form-input"
            placeholder="28"
            min={16}
            max={80}
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="form-label">FITNESS GOAL</label>
        <ChipGroup
          options={GOAL_OPTIONS}
          value={goal}
          onChange={(v) => setGoal(v as string)}
        />
      </div>

      <div>
        <label className="form-label">TRAINING DAYS PER WEEK</label>
        <select
          className="form-select w-full"
          value={trainingDays}
          onChange={(e) => setTrainingDays(e.target.value)}
        >
          {TRAINING_DAYS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">ACTIVITY LEVEL</label>
        <select
          className="form-select w-full"
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value)}
        >
          {ACTIVITY_LEVELS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">DIETARY RESTRICTIONS</label>
        <ChipGroup
          options={DIET_OPTIONS}
          value={dietaryRestrictions}
          onChange={(v) => setDietaryRestrictions(v as string[])}
          multiSelect
          noneValue="none"
        />
      </div>

      <div>
        <label className="form-label">PREFERRED FOODS (comma-separated)</label>
        <input
          type="text"
          className="form-input w-full"
          placeholder="e.g. chicken breast, eggs, oats, rice"
          value={availableFoods}
          onChange={(e) => setAvailableFoods(e.target.value)}
        />
      </div>

      <div>
        <label className="form-label">SUPPLEMENT PREFERENCE</label>
        {hasCoachSupplements ? (
          <p className="text-text-dim text-sm py-2">
            Your coach has assigned supplements. Contact them to change.
          </p>
        ) : (
          <select
            className="form-select w-full"
            value={supplements}
            onChange={(e) => setSupplements(e.target.value)}
          >
            {SUPPLEMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <div className="error-box">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="btn-form-next w-full py-3"
      >
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
