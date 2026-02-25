"use client";

interface ChipOption {
  value: string;
  label: string;
}

interface ChipGroupProps {
  options: ChipOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiSelect?: boolean;
  noneValue?: string; // When multiSelect, clicking "none" deselects others
}

export function ChipGroup({
  options,
  value,
  onChange,
  multiSelect = false,
  noneValue,
}: ChipGroupProps) {
  const isSelected = (optValue: string) => {
    if (Array.isArray(value)) {
      return value.includes(optValue);
    }
    return value === optValue;
  };

  const handleClick = (optValue: string) => {
    if (multiSelect) {
      const current = Array.isArray(value) ? value : [];
      if (optValue === noneValue) {
        onChange([optValue]);
      } else {
        const withoutNone = current.filter((v) => v !== (noneValue ?? "none"));
        if (current.includes(optValue)) {
          const next = withoutNone.filter((v) => v !== optValue);
          onChange(next.length ? next : [noneValue ?? "none"]);
        } else {
          onChange([...withoutNone, optValue]);
        }
      }
    } else {
      onChange(optValue);
    }
  };

  return (
    <div className="chip-group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`chip ${isSelected(opt.value) ? "selected" : ""}`}
          onClick={() => handleClick(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
