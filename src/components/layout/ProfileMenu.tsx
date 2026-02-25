"use client";

import { useState, useEffect, useRef } from "react";

type ProfileMenuVariant = "client" | "coach";

function getInitials(email: string | undefined): string {
  if (!email) return "U";
  const prefix = email.split("@")[0];
  if (!prefix) return "U";
  const parts = prefix.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  }
  return prefix.slice(0, 2).toUpperCase();
}

function getDisplayName(email: string | undefined): string {
  if (!email) return "User";
  const prefix = email.split("@")[0];
  return prefix || "User";
}

export function ProfileMenu({
  userEmail,
  variant,
}: {
  userEmail: string | undefined;
  variant: ProfileMenuVariant;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const roleLabel = variant === "coach" ? "Coach" : "Client";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-text-dim hover:bg-[var(--green-08)] hover:text-green transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--green-08)] text-green text-sm font-medium"
          aria-hidden
        >
          {getInitials(userEmail)}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-[var(--green-08)] bg-[var(--card)] py-2 shadow-lg z-50"
          role="menu"
        >
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-text truncate">
              {getDisplayName(userEmail)}
            </p>
            <p className="text-xs text-text-dim truncate mt-0.5">{userEmail}</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-[var(--green-08)] text-green">
              {roleLabel}
            </span>
          </div>
          <div className="border-t border-[var(--green-08)] my-2" />
          <form action="/auth/signout" method="post" className="px-2">
            <button
              type="submit"
              className="w-full text-left px-2 py-2 text-sm text-text-dim hover:text-green hover:bg-[var(--green-08)] rounded transition-colors"
              role="menuitem"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
