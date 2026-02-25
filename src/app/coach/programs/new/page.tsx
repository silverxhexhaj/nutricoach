import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProgramForm } from "@/components/programs/ProgramForm";

export default async function NewProgramPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/coach/programs/new");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!coach) redirect("/coach/onboarding");

  return (
    <div className="max-w-[720px] mx-auto py-12 px-6">
      <div className="mb-8">
        <h1 className="font-heading font-extrabold text-2xl mb-1">Create Program</h1>
        <p className="text-text-dim text-sm">
          Set up your program template. You can add content to each day after creation.
        </p>
      </div>
      <ProgramForm />
    </div>
  );
}
