import { forwardRef } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string | null;
  hint?: string;
  options: SelectOption[];
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className = "", id, ...props }, ref) => {
    const selectId = id ?? props.name ?? undefined;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text mb-2 font-heading"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full rounded-lg border bg-dark px-3 py-2 text-sm text-text outline-none transition-colors ${
            error
              ? "border-red-500/60 focus:border-red-500"
              : "border-[var(--green-08)] focus:border-green"
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        ) : hint ? (
          <p className="mt-2 text-xs text-text-dim">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
