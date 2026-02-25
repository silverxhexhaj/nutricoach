"use client";

import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { Sidebar, type SidebarNavItem } from "./Sidebar";

type CoachInfo = {
  name: string | null;
  brand_name: string | null;
  logo_url: string | null;
};

export function ClientShell({
  children,
  userEmail,
  coach,
}: {
  children: React.ReactNode;
  userEmail?: string;
  coach?: CoachInfo | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const iconClass = "h-4 w-4 shrink-0";
  const NAV_ITEMS: SidebarNavItem[] = [
    {
      href: "/app",
      label: "Dashboard",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconClass}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="2" />
          <rect x="14" y="3" width="7" height="4" rx="1.5" strokeWidth="2" />
          <rect x="14" y="10" width="7" height="11" rx="1.5" strokeWidth="2" />
          <rect x="3" y="13" width="7" height="8" rx="1.5" strokeWidth="2" />
        </svg>
      ),
      isActive: (p: string) => p === "/app",
    },
    {
      href: "/app/plan",
      label: "My Plan",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconClass}>
          <path d="M6 3h9l3 3v15H6z" strokeWidth="2" />
          <path d="M15 3v3h3" strokeWidth="2" />
          <path d="M9 11h6M9 15h6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      isActive: (p: string) => p.startsWith("/app/plan"),
    },
    {
      href: "/app/program",
      label: "My Program",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconClass}>
          <path d="M7 4h13v16H7z" strokeWidth="2" />
          <path d="M4 8h3M4 12h3M4 16h3" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      isActive: (p: string) => p.startsWith("/app/program"),
    },
    {
      href: "/app/library",
      label: "Library",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconClass}>
          <path d="M5 4h13a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V4z" strokeWidth="2" />
          <path d="M7 4v16" strokeWidth="2" />
          <path d="M10 9h7M10 13h7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      isActive: (p: string) => p.startsWith("/app/library"),
    },
    {
      href: "/app/activities",
      label: "Activities",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconClass}>
          <path d="M3 12h4l2-4 4 8 2-4h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      isActive: (p: string) => p === "/app/activities",
    },
    {
      href: "/app/progress",
      label: "Progress",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconClass}>
          <path d="M4 20h16" strokeWidth="2" />
          <path d="M7 15l3-3 2 2 5-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      isActive: (p: string) => p === "/app/progress",
    },
    {
      href: "/app/checkin",
      label: "Check-in",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconClass}>
          <path d="M9 11l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="3" y="4" width="18" height="17" rx="2" strokeWidth="2" />
          <path d="M8 2v4M16 2v4" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      isActive: (p: string) => p === "/app/checkin",
    },
  ];

  const BOTTOM_NAV_ITEMS: SidebarNavItem[] = [
    {
      href: "/app/profile",
      label: "Profile",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconClass}>
          <circle cx="12" cy="8" r="4" strokeWidth="2" />
          <path d="M5 21c1.8-3.5 4.2-5 7-5s5.2 1.5 7 5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      isActive: (p: string) => p === "/app/profile",
    },
  ];

  return (
    <div className="min-h-screen bg-dark">
      <AppHeader
        variant="client"
        userEmail={userEmail}
        coach={coach}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={NAV_ITEMS}
        bottomNavItems={BOTTOM_NAV_ITEMS}
        ariaLabel="Client navigation"
      />
      <main className="md:pl-[220px] min-h-[calc(100vh-77px)] mt-14">
        {children}
      </main>
    </div>
  );
}
