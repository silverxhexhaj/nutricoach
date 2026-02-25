import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CoachProfileForm } from "@/components/profile/CoachProfileForm";

export default async function CoachProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/coach/profile");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id, name, brand_name, logo_url")
    .eq("user_id", user.id)
    .single();

  if (!coach) redirect("/coach/onboarding");

  return (
    <div className="max-w-[1100px] mx-auto py-12 px-6">
      <h1 className="font-heading font-extrabold text-2xl mb-2">Profile</h1>
      <p className="text-text-dim text-sm mb-8">
        Update your coach profile and branding.
      </p>
      <CoachProfileForm
        initialName={coach.name}
        initialBrandName={coach.brand_name}
        initialLogoUrl={coach.logo_url}
      />
    </div>
  );
}
