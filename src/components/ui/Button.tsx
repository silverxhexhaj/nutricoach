import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "rounded-full font-heading font-bold cursor-pointer transition-all duration-150";
  const variants = {
    primary:
      "bg-green text-dark px-8 py-4 text-base hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(184,240,74,0.4)]",
    ghost:
      "bg-transparent text-text border border-white/15 px-7 py-4 text-[0.95rem] hover:border-green/30",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
