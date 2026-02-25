import Link from "next/link";

interface Client {
  id: string;
  name: string | null;
  onboarding_complete: boolean | null;
  current_plan_id: string | null;
}

interface ClientsGridProps {
  clients: Client[];
  todayCheckinClientIds: Set<string>;
  lastCheckinByClient: Map<string, string>;
}

export function ClientsGrid({
  clients,
  todayCheckinClientIds,
  lastCheckinByClient,
}: ClientsGridProps) {
  if (clients.length === 0) {
    return (
      <p className="text-text-dim text-sm py-8 text-center bg-card border border-[var(--green-08)] rounded-xl">
        No clients yet. Use the Invite button to add your first client.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map((client) => {
        const displayName = client.name || "Unnamed client";
        const todayCheckin = todayCheckinClientIds.has(client.id);
        const lastCheckinDate = lastCheckinByClient.get(client.id) ?? null;

        return (
          <div
            key={client.id}
            className="bg-card border border-[var(--green-08)] rounded-xl p-4 flex flex-col gap-3"
          >
            <Link
              href={`/coach/clients/${client.id}`}
              className="font-medium text-green hover:underline"
            >
              {displayName}
            </Link>
            <div className="flex flex-wrap gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  client.onboarding_complete
                    ? "bg-green/20 text-green"
                    : "bg-[var(--green-08)] text-text-dim"
                }`}
              >
                {client.onboarding_complete ? "Onboarded" : "Pending"}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  client.current_plan_id
                    ? "bg-green/20 text-green"
                    : "bg-[var(--green-08)] text-text-dim"
                }`}
              >
                {client.current_plan_id ? "Plan active" : "No plan"}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  todayCheckin ? "bg-green/20 text-green" : "bg-[var(--green-08)] text-text-dim"
                }`}
              >
                {todayCheckin ? "Check-in today" : "No check-in today"}
              </span>
            </div>
            {lastCheckinDate && (
              <p className="text-xs text-text-dim">
                Last seen:{" "}
                {new Date(lastCheckinDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            )}
            <Link
              href={`/coach/clients/${client.id}`}
              className="text-sm text-green hover:underline transition-colors mt-auto"
            >
              View progress →
            </Link>
          </div>
        );
      })}
    </div>
  );
}
