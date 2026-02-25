import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { resolveClientDisplayNames } from "@/lib/client-name";
import { PendingInviteRow } from "../dashboard/PendingInviteRow";
import { ClientsGrid } from "./ClientsGrid";
import { InviteClientButton } from "./InviteClientButton";

export default async function CoachClientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/coach/clients");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id, name, brand_name")
    .eq("user_id", user.id)
    .single();

  if (!coach) redirect("/coach/onboarding");

  const { data: clientsRaw } = await supabase
    .from("clients")
    .select("id, name, onboarding_complete, current_plan_id, user_id")
    .eq("coach_id", coach.id);

  const clients = await resolveClientDisplayNames(clientsRaw ?? []);

  const clientIds = clients?.map((c) => c.id) ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const [invitesRes, todayCheckinsRes, lastCheckinsRes] = await Promise.all([
    supabase
      .from("invites")
      .select("id, client_email, created_at, accepted_at, token")
      .eq("coach_id", coach.id)
      .order("created_at", { ascending: false }),
    clientIds.length > 0
      ? supabase
          .from("checkins")
          .select("client_id")
          .in("client_id", clientIds)
          .eq("date", today)
      : Promise.resolve({ data: [] }),
    clientIds.length > 0
      ? supabase
          .from("checkins")
          .select("client_id, date")
          .in("client_id", clientIds)
          .order("date", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const invites = invitesRes.data ?? [];
  const pendingInvites = invites.filter((i) => !i.accepted_at);

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? `${protocol}://${host}`;

  const todayCheckinClientIds = new Set(
    (todayCheckinsRes.data ?? []).map((c) => c.client_id)
  );
  const lastCheckinByClient = new Map<string, string>();
  for (const c of lastCheckinsRes.data ?? []) {
    if (!lastCheckinByClient.has(c.client_id)) {
      lastCheckinByClient.set(c.client_id, c.date);
    }
  }

  return (
    <div className="max-w-[900px] mx-auto py-12 px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-extrabold text-2xl mb-2">Clients</h1>
          <p className="text-text-dim">
            Manage your clients and invite new ones.
          </p>
        </div>
        <InviteClientButton coachId={coach.id} />
      </div>

      {pendingInvites.length > 0 && (
        <section className="mb-8">
          <h2 className="font-heading font-bold text-lg mb-4">
            Pending invites
          </h2>
          <ul className="space-y-0 bg-card border border-[var(--green-08)] rounded-xl overflow-hidden">
            {pendingInvites.map((inv) => (
              <PendingInviteRow
                key={inv.id}
                invite={inv}
                baseUrl={baseUrl}
              />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-heading font-bold text-lg mb-4">All clients</h2>
        <ClientsGrid
          clients={clients ?? []}
          todayCheckinClientIds={todayCheckinClientIds}
          lastCheckinByClient={lastCheckinByClient}
        />
      </section>
    </div>
  );
}
