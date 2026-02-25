import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CoachShell } from "@/components/layout/CoachShell";

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/coach/dashboard");

  return (
    <CoachShell userEmail={user.email ?? undefined}>{children}</CoachShell>
  );
}
