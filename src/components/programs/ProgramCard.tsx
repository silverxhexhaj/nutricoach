"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Program } from "@/types/program";
import { Modal } from "@/components/ui/Modal";

interface ProgramCardProps {
  program: Program;
  assignmentCount?: number;
  onDeleted: (id: string) => void;
}

function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full border ${
            i <= level ? "bg-green border-green" : "border-[var(--green-20)] bg-transparent"
          }`}
        />
      ))}
    </div>
  );
}

export function ProgramCard({ program, assignmentCount = 0, onDeleted }: ProgramCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleEdit = () => {
    router.push(`/coach/programs/${program.id}`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      const force = assignmentCount > 0 ? "?force=true" : "";
      const res = await fetch(`/api/programs/${program.id}${force}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted(program.id);
        setShowDeleteModal(false);
        return;
      }
      const payload = await res.json().catch(() => ({}));
      setDeleteError(payload.error ?? "Failed to delete program.");
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  const weekLabel = program.duration_weeks === 1 ? "1 week" : `${program.duration_weeks} weeks`;
  const daysLabel = program.days_per_week ? `${program.days_per_week}d/wk` : null;

  return (
    <div
      className="relative bg-card rounded-xl border border-[var(--green-08)] hover:border-[var(--green-20)] transition-colors group cursor-pointer"
      onClick={handleEdit}
    >
      {/* Color stripe */}
      <div
        className="h-1 rounded-t-xl"
        style={{ background: program.color }}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-heading font-bold text-sm leading-tight line-clamp-2 flex-1">
            {program.name}
          </h3>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="shrink-0 p-1 rounded-md text-text-dim hover:text-green hover:bg-[var(--green-08)] transition-colors"
            aria-label="Program options"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>
        </div>
        {assignmentCount > 0 && (
          <div className="mb-3">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--green-10)] text-green">
              {assignmentCount} client{assignmentCount === 1 ? "" : "s"}
            </span>
          </div>
        )}

        {program.description && (
          <p className="text-text-dim text-xs line-clamp-2 mb-3">{program.description}</p>
        )}

        <div className="flex items-center justify-between">
          <DifficultyDots level={program.difficulty} />
          <div className="flex items-center gap-2 text-xs text-text-dim">
            {daysLabel && <span>{daysLabel}</span>}
            <span>{weekLabel}</span>
          </div>
        </div>

        {program.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {program.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--green-08)] text-green"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
            }}
          />
          <div className="absolute top-10 right-4 z-20 bg-card border border-[var(--green-08)] rounded-lg shadow-xl py-1 min-w-[140px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                handleEdit();
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--green-08)] hover:text-green transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteError("");
                setShowDeleteModal(true);
              }}
              disabled={deleting}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </>
      )}
      <Modal
        open={showDeleteModal}
        onClose={() => {
          if (!deleting) setShowDeleteModal(false);
        }}
        title="Delete program"
        maxWidthClassName="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-dim">
            Delete <strong className="text-white">"{program.name}"</strong>? This cannot be undone.
          </p>
          {assignmentCount > 0 && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              Warning: this program is currently assigned to{" "}
              <strong>{assignmentCount} client{assignmentCount === 1 ? "" : "s"}</strong>.
              Force delete will also remove assignment and completion history.
            </div>
          )}
          {deleteError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {deleteError}
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
              className="px-3 py-2 text-sm text-text-dim hover:text-green transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-2 text-sm rounded-md bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors disabled:opacity-60"
            >
              {deleting ? "Deleting..." : assignmentCount > 0 ? "Force delete" : "Delete program"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
