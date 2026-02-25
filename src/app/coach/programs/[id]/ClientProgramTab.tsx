"use client";

import Link from "next/link";
import type {
  Program,
  ProgramDay,
  ClientProgramItemOverride,
} from "@/types/program";
import { mergeOverridesIntoDays } from "@/lib/programs/mergeOverrides";
import { WeekEditor } from "@/components/programs/WeekEditor";
import { ActivityFeed } from "./ActivityFeed";

interface ClientData {
  assignmentId: string;
  clientId: string;
  name: string;
  startDate: string;
  overrides: ClientProgramItemOverride[];
  dayCompletions: Record<string, string>;
  itemCompletions: Record<string, string>;
}

interface ClientProgramTabProps {
  program: Program;
  days: ProgramDay[];
  clientData: ClientData;
  onUnassign: () => void;
  unassigning: boolean;
}

export function ClientProgramTab({
  program,
  days,
  clientData,
  onUnassign,
  unassigning,
}: ClientProgramTabProps) {
  const mergedDays = mergeOverridesIntoDays(days, clientData.overrides, {
    includeHidden: true,
  });

  const totalDays = (program.duration_weeks ?? 1) * 7;
  const completedDays = Object.keys(clientData.dayCompletions).length;
  const completionPct =
    totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Client header card */}
      <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href={`/coach/clients/${clientData.clientId}`}
                className="font-heading font-bold text-lg text-green hover:underline"
              >
                {clientData.name}
              </Link>
            </div>
            <p className="text-xs text-text-dim">
              Started{" "}
              {new Date(clientData.startDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onUnassign}
            disabled={unassigning}
            className="text-xs px-2.5 py-1.5 rounded-md border border-red-400/40 text-red-300 hover:bg-red-400/10 transition-colors disabled:opacity-60"
          >
            {unassigning ? "Unassigning..." : "Unassign"}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-text-dim">Progress</span>
            <span className="font-medium">
              {completedDays}/{totalDays} days ({completionPct}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-dark overflow-hidden">
            <div
              className="h-full bg-green transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Program editor (2/3 width on large screens) */}
        <div className="lg:col-span-2">
          <div className="mb-5">
            <h2 className="font-heading font-bold text-lg mb-1">
              {clientData.name}&apos;s Program
            </h2>
            <p className="text-text-dim text-sm">
              Customize this client&apos;s program. Changes here only affect{" "}
              {clientData.name}, not the template.
            </p>
          </div>
          <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
            <WeekEditor
              program={program}
              days={mergedDays}
              coachClientView
              clientProgramId={clientData.assignmentId}
              startDate={clientData.startDate}
              dayCompletions={clientData.dayCompletions}
              itemCompletions={clientData.itemCompletions}
            />
          </div>
        </div>

        {/* Activity feed (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="mb-5">
            <h2 className="font-heading font-bold text-lg mb-1">Activity</h2>
            <p className="text-text-dim text-sm">Recent completions</p>
          </div>
          <div className="bg-card border border-[var(--green-08)] rounded-xl p-4">
            <ActivityFeed
              programId={program.id}
              clientProgramId={clientData.assignmentId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
