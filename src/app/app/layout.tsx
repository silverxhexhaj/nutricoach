import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ensureClientRow, getUserRole } from "@/lib/auth";
import { ClientShell } from "@/components/layout/ClientShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/app");

  const role = await getUserRole(user.id);
  if (role === "coach") redirect("/coach/dashboard");

  await ensureClientRow(user.id, undefined, user.email);

  const { data: client } = await supabase
    .from("clients")
    .select("id, coach_id, coaches(name, brand_name, logo_url)")
    .eq("user_id", user.id)
    .single();

  const rawCoach = client?.coaches ?? null;
  const coach = Array.isArray(rawCoach) ? rawCoach[0] ?? null : rawCoach;

  return (
    <ClientShell
      userEmail={user.email ?? undefined}
      coach={coach}
    >
      {children}
    </ClientShell>
  );
}
