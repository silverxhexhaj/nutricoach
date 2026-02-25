"use client";

import { ChipGroup } from "./ChipGroup";

const DIET_OPTIONS = [
  { value: "none", label: "None" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-Free" },
  { value: "dairy-free", label: "Dairy-Free" },
  { value: "halal", label: "Halal" },
];

const TRAINING_DAYS = [
  { value: "2", label: "2 days/week" },
  { value: "3", label: "3 days/week" },
  { value: "4", label: "4 days/week" },
  { value: "5", label: "5 days/week" },
  { value: "6", label: "6 days/week" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary (desk job, little movement)" },
  { value: "lightly active", label: "Lightly Active (1–3x/wk)" },
  { value: "moderately active", label: "Moderately Active (3–4x/wk)" },
  { value: "very active", label: "Very Active (5–6x/wk)" },
];

const SUPPLEMENT_OPTIONS = [
  { value: "standard", label: "Standard supplements (whey, creatine, etc.)" },
  { value: "herbalife", label: "Include Herbalife products" },
  { value: "mixed", label: "Mix of both" },
];

interface FormStep2Props {
  active?: boolean;
  values: {
    trainingDays: string;
    activityLevel: string;
    dietaryRestrictions: string[];
    foodsToAvoid: string;
    supplementPreference: "standard" | "herbalife" | "mixed";
  };
  onChange: (field: string, value: string | string[]) => void;
}

export function FormStep2({ active, values, onChange }: FormStep2Props) {
  return (
    <div className={`form-step ${active ? "active" : ""}`} id="formStep2">
      <h3 className="font-heading font-bold text-xl mb-6">Your Lifestyle</h3>
      <div className="form-grid">
        <div className="form-group full">
          <label className="form-label">TRAINING DAYS PER WEEK</label>
          <select
            className="form-select"
            value={values.trainingDays}
            onChange={(e) => onChange("trainingDays", e.target.value)}
          >
            {TRAINING_DAYS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group full">
          <label className="form-label">ACTIVITY LEVEL</label>
          <select
            className="form-select"
            value={values.activityLevel}
            onChange={(e) => onChange("activityLevel", e.target.value)}
          >
            {ACTIVITY_LEVELS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group full">
          <label className="form-label">DIETARY RESTRICTIONS</label>
          <ChipGroup
            options={DIET_OPTIONS}
            value={values.dietaryRestrictions}
            onChange={(v) => onChange("dietaryRestrictions", v as string[])}
            multiSelect
            noneValue="none"
          />
        </div>
        <div className="form-group full">
          <label className="form-label">FOODS TO AVOID (optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. mushrooms, seafood"
            value={values.foodsToAvoid}
            onChange={(e) => onChange("foodsToAvoid", e.target.value)}
          />
        </div>
        <div className="form-group full">
          <label className="form-label">SUPPLEMENT PREFERENCE</label>
          <select
            className="form-select"
            value={values.supplementPreference}
            onChange={(e) =>
              onChange("supplementPreference", e.target.value as "standard" | "herbalife" | "mixed")
            }
          >
            {SUPPLEMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
