"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "./AppHeader";
import { Sidebar, type SidebarNavItem } from "./Sidebar";

export function CoachShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const iconClass = "h-4 w-4 shrink-0";
  const NAV_ITEMS: SidebarNavItem[] = [
    {
      href: "/coach/dashboard",
      label: "Dashboard",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconClass}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="2" />
          <rect x="14" y="3" width="7" height="4" rx="1.5" strokeWidth="2" />
          <rect x="14" y="10" width="7" height="11" rx="1.5" strokeWidth="2" />
          <rect x="3" y="13" width="7" height="8" rx="1.5" strokeWidth="2" />
        </svg>
      ),
      isActive: (p: string) => p === "/coach/dashboard",
    },
    {
      href: "/coach/programs",
      label: "Programs",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconClass}>
          <path d="M7 4h13v16H7z" strokeWidth="2" />
          <path d="M4 8h3M4 12h3M4 16h3" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      isActive: (p: string) => p.startsWith("/coach/programs"),
    },
    {
      href: "/coach/library",
      label: "Library",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconClass}>
          <path d="M5 4h4v16H5zM10 4h4v16h-4zM15 4h4v16h-4z" strokeWidth="2" />
        </svg>
      ),
      isActive: (p: string) => p.startsWith("/coach/library"),
    },
    {
      href: "/coach/clients",
      label: "Clients",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconClass}>
          <circle cx="9" cy="8" r="3" strokeWidth="2" />
          <circle cx="17" cy="10" r="2.5" strokeWidth="2" />
          <path d="M3.5 20c1.5-3 3.4-4.5 5.5-4.5s4 1.5 5.5 4.5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      isActive: (p: string) => p.startsWith("/coach/clients"),
    },
    {
      href: "/coach/calendar",
      label: "Calendar",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconClass}>
          <rect x="3" y="4" width="18" height="17" rx="2" strokeWidth="2" />
          <path d="M8 2v4M16 2v4M3 10h18" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      isActive: (p: string) => p === "/coach/calendar",
    },
  ];
  const BOTTOM_NAV_ITEMS: SidebarNavItem[] = [
    {
      href: "/coach/profile",
      label: "Profile",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={iconClass}>
          <circle cx="12" cy="8" r="4" strokeWidth="2" />
          <path d="M5 21c1.8-3.5 4.2-5 7-5s5.2 1.5 7 5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      isActive: (p: string) => p === "/coach/profile",
    },
  ];

  const isOnboarding = pathname === "/coach/onboarding";
  const showSidebar = !isOnboarding;

  return (
    <div className="min-h-screen bg-dark">
      <AppHeader
        variant="coach"
        userEmail={userEmail}
        onMenuClick={showSidebar ? () => setSidebarOpen(true) : undefined}
      />
      {showSidebar && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          navItems={NAV_ITEMS}
          bottomNavItems={BOTTOM_NAV_ITEMS}
          ariaLabel="Coach navigation"
        />
      )}
      <main
        className={
          showSidebar
            ? "md:pl-[220px] min-h-[calc(100vh-77px)] mt-14"
            : "min-h-[calc(100vh-77px)] mt-30"
        }
      >
        {children}
      </main>
    </div>
  );
}
