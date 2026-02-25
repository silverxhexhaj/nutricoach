interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-card border border-[var(--green-08)] rounded-[20px] p-7 ${className}`}
    >
      {children}
    </div>
  );
}
