import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { resolveClientDisplayNames } from "@/lib/client-name";
import { CoachCheckInCalendar } from "./CoachCheckInCalendar";

export default async function CoachCalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/coach/calendar");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id, name, brand_name")
    .eq("user_id", user.id)
    .single();

  if (!coach) redirect("/coach/onboarding");

  const { data: clientsRaw } = await supabase
    .from("clients")
    .select("id, name, user_id")
    .eq("coach_id", coach.id);

  const clients = await resolveClientDisplayNames(clientsRaw ?? []);
  const clientMap = new Map(clients.map((c) => [c.id, c.name ?? "Unnamed"]));

  return (
    <div className="max-w-[900px] mx-auto py-12 px-6">
      <h1 className="font-heading font-extrabold text-2xl mb-2">Check-In Calendar</h1>
      <p className="text-text-dim mb-8">
        See which clients checked in each day. Green = all checked in, light green = some, gray = none.
      </p>
      <CoachCheckInCalendar clientMap={Object.fromEntries(clientMap)} />
    </div>
  );
}
