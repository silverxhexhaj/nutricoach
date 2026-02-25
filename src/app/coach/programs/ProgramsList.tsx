"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Program } from "@/types/program";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { ProgramFilters } from "@/components/programs/ProgramFilters";

interface ProgramsListProps {
  initialPrograms: Program[];
  initialAssignmentCounts: Record<string, number>;
}

export function ProgramsList({ initialPrograms, initialAssignmentCounts }: ProgramsListProps) {
  const router = useRouter();
  const [programs, setPrograms] = useState(initialPrograms);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState("");

  const filtered = programs.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = !difficulty || p.difficulty === parseInt(difficulty);
    const matchDays = !daysPerWeek || p.days_per_week === parseInt(daysPerWeek);
    return matchSearch && matchDifficulty && matchDays;
  });

  const handleDeleted = (id: string) => {
    setPrograms((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-2xl mb-1">Programs</h1>
          <p className="text-text-dim text-sm">
            Create reusable program templates to assign to your clients.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/coach/programs/new")}
          className="btn-primary px-5 py-2.5 text-sm font-semibold rounded-lg"
        >
          + Create Program
        </button>
      </div>

      <div className="mb-6">
        <ProgramFilters
          search={search}
          onSearchChange={setSearch}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          daysPerWeek={daysPerWeek}
          onDaysPerWeekChange={setDaysPerWeek}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-text-dim">
          {programs.length === 0 ? (
            <div>
              <p className="text-lg font-heading font-bold mb-2">No programs yet</p>
              <p className="text-sm mb-6">Create your first program template to get started.</p>
              <button
                type="button"
                onClick={() => router.push("/coach/programs/new")}
                className="btn-primary px-5 py-2.5 text-sm font-semibold rounded-lg"
              >
                + Create Program
              </button>
            </div>
          ) : (
            <p>No programs match your filters.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              assignmentCount={initialAssignmentCounts[program.id] ?? 0}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
