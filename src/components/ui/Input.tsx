import { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
  hint?: string;
  icon?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = "", id, ...props }, ref) => {
    const inputId = id ?? props.name ?? undefined;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text mb-2 font-heading"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-lg border bg-dark px-3 py-2 text-sm text-text placeholder:text-text-dim outline-none transition-colors ${
              icon ? "pl-10" : ""
            } ${
              error
                ? "border-red-500/60 focus:border-red-500"
                : "border-[var(--green-08)] focus:border-green"
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        ) : hint ? (
          <p className="mt-2 text-xs text-text-dim">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
