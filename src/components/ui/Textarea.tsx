import { forwardRef } from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string | null;
  hint?: string;
  maxLengthHint?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      maxLengthHint = false,
      className = "",
      id,
      value,
      maxLength,
      ...props
    },
    ref
  ) => {
    const textareaId = id ?? props.name ?? undefined;
    const used = typeof value === "string" ? value.length : 0;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-text mb-2 font-heading"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          className={`w-full rounded-lg border bg-dark px-3 py-2 text-sm text-text placeholder:text-text-dim outline-none transition-colors min-h-[96px] ${
            error
              ? "border-red-500/60 focus:border-red-500"
              : "border-[var(--green-08)] focus:border-green"
          } ${className}`}
          {...props}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className={`text-xs ${error ? "text-red-400" : "text-text-dim"}`}>
            {error ?? hint ?? ""}
          </p>
          {maxLengthHint && typeof maxLength === "number" && (
            <p className="text-xs text-text-dim">
              {used}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
