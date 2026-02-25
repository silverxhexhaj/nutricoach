"use client";

import { useState } from "react";
import Link from "next/link";
import type { Program, ProgramDay, ClientProgramItemOverride } from "@/types/program";
import { Modal } from "@/components/ui/Modal";
import { ProgramForm } from "@/components/programs/ProgramForm";
import { WeekEditor } from "@/components/programs/WeekEditor";
import { AssignProgramModal } from "./AssignProgramModal";
import { ClientProgramTab } from "./ClientProgramTab";

interface Client {
  id: string;
  name: string | null;
}

interface AssignedClientData {
  assignmentId: string;
  clientId: string;
  name: string;
  startDate: string;
  overrides: ClientProgramItemOverride[];
  dayCompletions: Record<string, string>;
  itemCompletions: Record<string, string>;
}

interface ProgramEditClientProps {
  program: Program;
  days: ProgramDay[];
  clients: Client[];
  assignedClients: AssignedClientData[];
}

export function ProgramEditClient({
  program: initialProgram,
  days,
  clients,
  assignedClients: initialAssignedClients,
}: ProgramEditClientProps) {
  const [program, setProgram] = useState(initialProgram);
  const [saved, setSaved] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [assignedClients, setAssignedClients] = useState(initialAssignedClients);
  const [unassigningId, setUnassigningId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("template");

  const handleSaved = (updated: Program) => {
    setProgram(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleUnassign = async (assignmentId: string) => {
    setUnassigningId(assignmentId);
    try {
      const response = await fetch(`/api/programs/${program.id}/assign`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientProgramId: assignmentId }),
      });
      if (response.ok) {
        setAssignedClients((prev) => prev.filter((c) => c.assignmentId !== assignmentId));
        if (activeTab === assignmentId) setActiveTab("template");
      }
    } finally {
      setUnassigningId(null);
    }
  };

  const totalDays = (program.duration_weeks ?? 1) * 7;

  return (
    <div className="max-w-[960px] mx-auto py-12 px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-dim mb-8">
        <Link href="/coach/programs" className="hover:text-green transition-colors">
          Programs
        </Link>
        <span>/</span>
        <span className="text-white truncate max-w-[200px]">{program.name}</span>
      </nav>

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: program.color }}
            />
            <h1 className="font-heading font-extrabold text-2xl">{program.name}</h1>
          </div>
          {program.description && (
            <p className="text-text-dim text-sm max-w-xl">{program.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green animate-fade-in">Saved!</span>
          )}
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-[var(--green-08)] hover:border-green transition-colors"
          >
            Edit Details
          </button>
          <button
            type="button"
            onClick={() => setShowAssign(true)}
            className="btn-primary px-5 py-2.5 text-sm font-semibold rounded-lg"
          >
            Assign to Client
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-[var(--green-08)] mb-8 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("template")}
          className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "template"
              ? "border-green text-green"
              : "border-transparent text-text-dim hover:text-white"
          }`}
        >
          Template
        </button>
        {assignedClients.map((ac) => {
          const completedDays = Object.keys(ac.dayCompletions).length;
          return (
            <button
              key={ac.assignmentId}
              type="button"
              onClick={() => setActiveTab(ac.assignmentId)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === ac.assignmentId
                  ? "border-green text-green"
                  : "border-transparent text-text-dim hover:text-white"
              }`}
            >
              {ac.name}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === ac.assignmentId
                    ? "bg-green/20 text-green"
                    : "bg-[var(--green-08)] text-text-dim"
                }`}
              >
                {completedDays}/{totalDays}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "template" ? (
        <div className="space-y-12">
          {/* Assigned clients summary */}
          <section>
            <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-heading font-bold text-lg">
                  Assigned to {assignedClients.length} client{assignedClients.length === 1 ? "" : "s"}
                </h2>
              </div>
              {assignedClients.length === 0 ? (
                <p className="text-sm text-text-dim">No active client assignments for this program yet.</p>
              ) : (
                <div className="space-y-2">
                  {assignedClients.map((assignment) => (
                    <div
                      key={assignment.assignmentId}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[var(--green-08)] bg-dark px-3 py-2"
                    >
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setActiveTab(assignment.assignmentId)}
                          className="text-sm font-medium text-green hover:underline"
                        >
                          {assignment.name}
                        </button>
                        <p className="text-xs text-text-dim">
                          Started {new Date(assignment.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnassign(assignment.assignmentId)}
                        disabled={unassigningId === assignment.assignmentId}
                        className="text-xs px-2.5 py-1.5 rounded-md border border-red-400/40 text-red-300 hover:bg-red-400/10 transition-colors disabled:opacity-60"
                      >
                        {unassigningId === assignment.assignmentId ? "Unassigning..." : "Unassign"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Template content editor */}
          <section>
            <div className="mb-5">
              <h2 className="font-heading font-bold text-lg mb-1">Edit Program Content</h2>
              <p className="text-text-dim text-sm">
                Programs are organized by days. Your program will start on Day 1 after you apply it to your client.
              </p>
            </div>
            <div className="bg-card border border-[var(--green-08)] rounded-xl p-6">
              <WeekEditor program={program} days={days} />
            </div>
          </section>
        </div>
      ) : (
        (() => {
          const clientData = assignedClients.find(
            (ac) => ac.assignmentId === activeTab
          );
          if (!clientData) return null;
          return (
            <ClientProgramTab
              program={program}
              days={days}
              clientData={clientData}
              onUnassign={() => handleUnassign(clientData.assignmentId)}
              unassigning={unassigningId === clientData.assignmentId}
            />
          );
        })()
      )}

      <Modal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        title="Program Details"
        maxWidthClassName="max-w-2xl"
      >
        <ProgramForm
          program={program}
          onSaved={(updated) => {
            handleSaved(updated);
            setShowDetails(false);
          }}
          onCancel={() => setShowDetails(false)}
        />
      </Modal>

      {showAssign && (
        <AssignProgramModal
          program={program}
          clients={clients}
          onClose={() => setShowAssign(false)}
        />
      )}
    </div>
  );
}
