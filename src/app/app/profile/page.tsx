import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientProfileForm } from "@/components/profile/ClientProfileForm";

export default async function ClientProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "weight_kg, height_cm, age, goal, activity_level, training_days, dietary_restrictions, available_foods, supplements, herbalife_products, other_supplements"
    )
    .eq("user_id", user.id)
    .single();

  const initialProfile = {
    weight_kg: profile?.weight_kg ?? null,
    height_cm: profile?.height_cm ?? null,
    age: profile?.age ?? null,
    goal: profile?.goal ?? null,
    activity_level: profile?.activity_level ?? null,
    training_days: profile?.training_days ?? null,
    dietary_restrictions: profile?.dietary_restrictions ?? null,
    available_foods: profile?.available_foods ?? null,
    supplements: profile?.supplements ?? null,
    herbalife_products: profile?.herbalife_products ?? null,
    other_supplements: profile?.other_supplements ?? null,
  };

  return (
    <div className="max-w-[1100px] mx-auto py-12 px-6">
      <h1 className="font-heading font-extrabold text-2xl mb-2">Profile</h1>
      <p className="text-text-dim text-sm mb-8">
        Update your nutrition profile. These details are used when generating
        your meal plan.
      </p>
      <ClientProfileForm initialProfile={initialProfile} />
    </div>
  );
}
