interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionTitle({ children, className = "" }: SectionTitleProps) {
  return (
    <h2
      className={`font-heading text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.03em] leading-tight mb-4 ${className}`}
    >
      {children}
    </h2>
  );
}
