"use client";

import Link from "next/link";

interface ExportPlanButtonProps {
  planId: string | null;
  clientName?: string;
}

export function ExportPlanButton({ planId }: ExportPlanButtonProps) {
  if (!planId) {
    return (
      <span className="text-sm text-text-dim" title="Generate a plan first">
        No plan to export
      </span>
    );
  }

  return (
    <Link
      href={`/api/plans/${planId}/pdf`}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full font-heading font-bold cursor-pointer transition-all duration-150 bg-transparent text-text border border-white/15 px-7 py-4 text-[0.95rem] hover:border-green/30 inline-block"
    >
      Download PDF
    </Link>
  );
}
