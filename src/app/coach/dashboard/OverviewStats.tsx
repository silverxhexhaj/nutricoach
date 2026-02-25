import Link from "next/link";

interface OverviewStatsProps {
  totalClients: number;
  checkinsToday: number;
  activePlans: number;
}

export function OverviewStats({
  totalClients,
  checkinsToday,
  activePlans,
}: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="bg-card border border-[var(--green-08)] rounded-xl p-4">
        <p className="text-text-dim text-sm font-medium mb-1">Total clients</p>
        <p className="font-heading font-bold text-xl text-green">{totalClients}</p>
      </div>
      <Link
        href="/coach/calendar"
        className="bg-card border border-[var(--green-08)] rounded-xl p-4 hover:border-green/30 transition-colors block"
      >
        <p className="text-text-dim text-sm font-medium mb-1">Check-ins today</p>
        <p className="font-heading font-bold text-xl text-green">
          {checkinsToday}
        </p>
      </Link>
      <div className="bg-card border border-[var(--green-08)] rounded-xl p-4">
        <p className="text-text-dim text-sm font-medium mb-1">Active plans</p>
        <p className="font-heading font-bold text-xl text-green">
          {activePlans}
        </p>
      </div>
    </div>
  );
}
