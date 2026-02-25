"use client";

import { ITEM_TYPES } from "@/components/programs/ContentItemFields";

interface LibraryFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
}

export function LibraryFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
}: LibraryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search library..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-card border border-[var(--green-08)] rounded-lg pl-9 pr-4 py-2.5 text-sm placeholder:text-text-dim focus:outline-none focus:border-green transition-colors"
        />
      </div>

      <select
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value)}
        className="bg-card border border-[var(--green-08)] rounded-lg px-3 py-2.5 text-sm text-text-dim focus:outline-none focus:border-green transition-colors cursor-pointer"
      >
        <option value="">All Types</option>
        {ITEM_TYPES.map(({ type, label }) => (
          <option key={type} value={type}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
