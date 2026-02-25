interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <div
      className={`text-[0.75rem] font-semibold tracking-[0.12em] uppercase text-green mb-3 ${className}`}
    >
      {children}
    </div>
  );
}
