"use client";

import { ChipGroup } from "./ChipGroup";

const GOAL_OPTIONS = [
  { value: "Muscle Building", label: "💪 Muscle Building" },
  { value: "Fat Loss", label: "🔥 Fat Loss" },
  { value: "Maintenance", label: "⚖️ Maintenance" },
  { value: "Endurance", label: "🏃 Endurance" },
];

interface FormStep1Props {
  active?: boolean;
  values: {
    firstName: string;
    age: string;
    weight: string;
    height: string;
    sex: "male" | "female";
    fitnessGoal: string;
  };
  onChange: (field: string, value: string | string[]) => void;
  error: string | null;
}

export function FormStep1({ active, values, onChange, error }: FormStep1Props) {
  return (
    <div className={`form-step ${active ? "active" : ""}`} id="formStep1">
      <h3 className="font-heading font-bold text-xl mb-6">Your Stats</h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">FIRST NAME</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. James"
            value={values.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
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
            value={values.age}
            onChange={(e) => onChange("age", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">WEIGHT (kg)</label>
          <input
            type="number"
            className="form-input"
            placeholder="80"
            min={40}
            max={200}
            value={values.weight}
            onChange={(e) => onChange("weight", e.target.value)}
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
            value={values.height}
            onChange={(e) => onChange("height", e.target.value)}
          />
        </div>
        <div className="form-group full">
          <label className="form-label">BIOLOGICAL SEX</label>
          <select
            className="form-select"
            value={values.sex}
            onChange={(e) => onChange("sex", e.target.value as "male" | "female")}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="form-group full">
          <label className="form-label">FITNESS GOAL</label>
          <ChipGroup
            options={GOAL_OPTIONS}
            value={values.fitnessGoal}
            onChange={(v) => onChange("fitnessGoal", v as string)}
          />
        </div>
      </div>
      {error && <div className="error-box">{error}</div>}
    </div>
  );
}
