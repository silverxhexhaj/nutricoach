interface BadgeProps {
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

export function Badge({ children, showDot = true, className = "" }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 bg-[var(--green-10)] border border-[var(--green-25)] rounded-full px-4 py-1.5 text-[0.78rem] text-green animate-[fadeUp_0.6s_ease_both] ${className}`}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-green animate-[pulse_2s_infinite]"
          aria-hidden
        />
      )}
      {children}
    </div>
  );
}
