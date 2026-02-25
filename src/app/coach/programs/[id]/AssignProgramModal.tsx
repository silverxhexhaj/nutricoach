"use client";

import { useState } from "react";
import type { Program } from "@/types/program";

interface Client {
  id: string;
  name: string | null;
}

interface AssignProgramModalProps {
  program: Program;
  clients: Client[];
  onClose: () => void;
}

export function AssignProgramModal({ program, clients, onClose }: AssignProgramModalProps) {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAssign = async () => {
    if (!selectedClientId) {
      setError("Please select a client.");
      return;
    }
    if (!startDate) {
      setError("Please select a start date.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/programs/${program.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: selectedClientId, start_date: startDate }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card border border-[var(--green-08)] rounded-t-2xl sm:rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--green-08)]">
          <h2 className="font-heading font-bold text-base">Assign Program to Client</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-dim hover:text-green transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-[var(--green-10)] flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">Program Assigned!</h3>
              <p className="text-text-dim text-sm mb-6">
                <strong>{program.name}</strong> has been assigned to{" "}
                <strong>{clients.find((c) => c.id === selectedClientId)?.name ?? "the client"}</strong>{" "}
                starting <strong>{startDate}</strong>.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-lg"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Program info */}
              <div className="flex items-center gap-3 p-3 bg-dark rounded-lg border border-[var(--green-08)]">
                <div className="w-3 h-10 rounded-sm" style={{ background: program.color }} />
                <div>
                  <p className="font-medium text-sm">{program.name}</p>
                  <p className="text-xs text-text-dim">{program.duration_weeks} week{program.duration_weeks > 1 ? "s" : ""}</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Client selector */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Select Client <span className="text-red-400">*</span>
                </label>
                {clients.length === 0 ? (
                  <p className="text-sm text-text-dim bg-dark border border-[var(--green-08)] rounded-lg px-4 py-3">
                    You have no active clients yet.
                  </p>
                ) : (
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green transition-colors cursor-pointer"
                  >
                    <option value="">Choose a client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name ?? "Unnamed Client"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Start date */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Start Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-dark border border-[var(--green-08)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green transition-colors [color-scheme:dark]"
                />
                <p className="text-xs text-text-dim mt-1">
                  Day 1 of the program will begin on this date.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={saving || clients.length === 0}
                  className="btn-primary flex-1 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-60"
                >
                  {saving ? "Assigning..." : "Assign Program"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm text-text-dim hover:text-green transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
