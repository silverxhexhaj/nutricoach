"use client";

import { useState, useEffect } from "react";

const MENU_ITEMS = [
  { id: "for-coaches", label: "For Coaches" },
  { id: "build", label: "Build My Plan" },
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing" },
] as const;

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleAnchorClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    scrollTo(id);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-[rgba(13,18,8,0.9)] backdrop-blur-xl border-b border-[var(--green-08)]"
    >
      <div className="font-heading font-extrabold text-xl text-green">
        NutriCoach<span className="text-text"> AI</span>
      </div>

      {/* Desktop menu */}
      <ul className="hidden md:flex gap-9 list-none">
        {MENU_ITEMS.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(item.id);
              }}
              className="text-text-dim text-[0.9rem] no-underline transition-colors hover:text-green"
            >
              {item.label}
            </a>
          </li>
        ))}
        <li>
          <a
            href="/login"
            className="text-text-dim text-[0.9rem] no-underline transition-colors hover:text-green"
          >
            Log in
          </a>
        </li>
      </ul>

      {/* Mobile hamburger button */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((prev) => !prev)}
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
            className="transition-transform duration-200"
          >
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
        <a
          href="/signup"
          className="bg-green text-dark border-none px-4 py-2 rounded-full font-heading font-bold text-[0.8rem] cursor-pointer no-underline"
        >
          Get My Plan →
        </a>
      </div>

      {/* Desktop CTA - hidden on mobile (shown in hamburger row) */}
      <a
        href="/signup"
        className="hidden md:inline-block bg-green text-dark border-none px-6 py-2.5 rounded-full font-heading font-bold text-[0.85rem] cursor-pointer no-underline"
      >
        Get My Plan →
      </a>

      {/* Mobile slide-out menu */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-0 top-[65px] z-40 md:hidden bg-dark/95 backdrop-blur-xl transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <ul
          className="flex flex-col gap-1 pt-6 px-6 list-none"
          onClick={(e) => e.stopPropagation()}
        >
          {MENU_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleAnchorClick(e, item.id)}
                className="block py-4 text-text text-[1rem] no-underline transition-colors hover:text-green border-b border-[var(--green-08)]"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block py-4 text-text text-[1rem] no-underline transition-colors hover:text-green border-b border-[var(--green-08)]"
            >
              Log in
            </a>
          </li>
          <li className="pt-4">
            <a
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center bg-green text-dark py-4 rounded-full font-heading font-bold text-[0.9rem] no-underline"
            >
              Get My Plan →
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
