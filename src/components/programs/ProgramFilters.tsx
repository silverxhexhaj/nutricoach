"use client";

interface ProgramFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  difficulty: string;
  onDifficultyChange: (v: string) => void;
  daysPerWeek: string;
  onDaysPerWeekChange: (v: string) => void;
}

export function ProgramFilters({
  search,
  onSearchChange,
  difficulty,
  onDifficultyChange,
  daysPerWeek,
  onDaysPerWeekChange,
}: ProgramFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
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
          placeholder="Search programs..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-card border border-[var(--green-08)] rounded-lg pl-9 pr-4 py-2.5 text-sm placeholder:text-text-dim focus:outline-none focus:border-green transition-colors"
        />
      </div>

      {/* Difficulty filter */}
      <select
        value={difficulty}
        onChange={(e) => onDifficultyChange(e.target.value)}
        className="bg-card border border-[var(--green-08)] rounded-lg px-3 py-2.5 text-sm text-text-dim focus:outline-none focus:border-green transition-colors cursor-pointer"
      >
        <option value="">All Difficulties</option>
        <option value="1">Beginner</option>
        <option value="2">Intermediate</option>
        <option value="3">Advanced</option>
      </select>

      {/* Days per week filter */}
      <select
        value={daysPerWeek}
        onChange={(e) => onDaysPerWeekChange(e.target.value)}
        className="bg-card border border-[var(--green-08)] rounded-lg px-3 py-2.5 text-sm text-text-dim focus:outline-none focus:border-green transition-colors cursor-pointer"
      >
        <option value="">All Days / Week</option>
        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
          <option key={d} value={String(d)}>
            {d} day{d > 1 ? "s" : ""} / week
          </option>
        ))}
      </select>
    </div>
  );
}
