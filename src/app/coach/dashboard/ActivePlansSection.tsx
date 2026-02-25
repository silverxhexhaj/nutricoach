import Link from "next/link";
import { ExportPlanButton } from "../clients/[id]/ExportPlanButton";

export interface ClientWithPlan {
  id: string;
  name: string | null;
  current_plan_id: string | null;
}

interface ActivePlansSectionProps {
  clients: ClientWithPlan[];
}

export function ActivePlansSection({ clients }: ActivePlansSectionProps) {
  const clientsWithPlans = clients.filter((c) => c.current_plan_id);

  if (clientsWithPlans.length === 0) {
    return (
      <p className="text-text-dim text-sm mb-4">
        No active plans yet. Generate a plan for a client from their profile.
      </p>
    );
  }

  return (
    <ul className="space-y-0">
      {clientsWithPlans.map((c) => (
        <li
          key={c.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-[var(--green-08)] gap-3"
        >
          <Link
            href={`/coach/clients/${c.id}`}
            className="font-medium text-green hover:underline"
          >
            {c.name ?? "Unnamed client"}
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/coach/clients/${c.id}`}
              className="text-sm text-text-dim hover:text-green transition-colors"
            >
              View plan
            </Link>
            <ExportPlanButton
              planId={c.current_plan_id}
              clientName={c.name ?? undefined}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
