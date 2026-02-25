"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon?: ReactNode;
  isActive: (pathname: string) => boolean;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  navItems: SidebarNavItem[];
  bottomNavItems: SidebarNavItem[];
  ariaLabel: string;
}

export function Sidebar({
  open,
  onClose,
  navItems,
  bottomNavItems,
  ariaLabel,
}: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLinkClick = () => {
    onClose();
  };

  const navLink = (item: SidebarNavItem) => {
    const isActive = item.isActive(pathname);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={handleLinkClick}
        className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-[var(--green-10)] text-green"
            : "text-text-dim hover:text-green hover:bg-[var(--green-08)]"
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  };

  const mainNav = <nav className="flex flex-col gap-1">{navItems.map(navLink)}</nav>;

  const bottomNav = (
    <nav className="flex flex-col gap-1 py-4 border-t border-[var(--green-08)] shrink-0">
      {bottomNavItems.map(navLink)}
    </nav>
  );

  const sidebarContent = (
    <div className="flex flex-col flex-1 min-h-0 px-3 pt-6">
      <div className="flex-1 overflow-y-auto">{mainNav}</div>
      {bottomNav}
    </div>
  );

  return (
    <>
      <aside
        className="hidden md:flex md:flex-col md:fixed md:top-[77px] md:left-0 md:bottom-0 md:w-[220px] md:border-r md:border-[var(--green-08)] md:bg-[rgba(13,18,8,0.95)] md:backdrop-blur-xl md:z-30"
        aria-label={ariaLabel}
      >
        {sidebarContent}
      </aside>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-0 top-0 z-50 md:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        <div
          className={`absolute top-0 left-0 bottom-0 w-[260px] max-w-[85vw] bg-dark border-r border-[var(--green-08)] shadow-xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--green-08)]">
            <span className="font-heading font-bold text-green">Menu</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="p-2 -mr-2 text-text-dim hover:text-green transition-colors"
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col flex-1 min-h-0 px-3 pt-4 overflow-y-auto">
            {mainNav}
            {bottomNav}
          </div>
        </div>
      </div>
    </>
  );
}
