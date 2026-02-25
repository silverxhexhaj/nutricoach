"use client";

import Link from "next/link";
import { ProfileMenu } from "./ProfileMenu";

type AppHeaderVariant = "client" | "coach";

type CoachInfo = {
  name: string | null;
  brand_name: string | null;
  logo_url: string | null;
};

export function AppHeader({
  variant,
  userEmail,
  coach,
  onMenuClick,
}: {
  variant: AppHeaderVariant;
  userEmail?: string;
  coach?: CoachInfo | null;
  onMenuClick?: () => void;
}) {
  const logoHref = variant === "client" ? "/app" : "/coach/dashboard";
  const coachDisplayName =
    coach?.brand_name || coach?.name || (coach ? "Your Coach" : null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--green-08)] px-6 md:px-12 py-4 flex items-center justify-between bg-[rgba(13,18,8,0.9)] backdrop-blur-xl">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            type="button"
            aria-label="Open menu"
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-text-dim hover:text-green transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        <Link
          href={logoHref}
          className="font-heading font-extrabold text-xl text-green"
        >
          NutriCoach <span className="text-text">AI</span>
        </Link>
        {variant === "client" && coachDisplayName && (
          <span className="text-sm text-text-dim flex items-center gap-1.5">
            Coached by{" "}
            {coach?.logo_url ? (
              <span className="inline-flex items-center gap-1.5">
                <img
                  src={coach.logo_url}
                  alt=""
                  className="h-5 w-5 rounded-full object-cover"
                />
                <span className="text-text">{coachDisplayName}</span>
              </span>
            ) : (
              <span className="text-text">{coachDisplayName}</span>
            )}
          </span>
        )}
      </div>
      <nav className="flex items-center gap-4">
        <ProfileMenu userEmail={userEmail} variant={variant} />
      </nav>
    </header>
  );
}
