"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCoachProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const name = (formData.get("name") as string)?.trim() || null;
  const brandName = (formData.get("brand_name") as string)?.trim() || null;
  const logoUrl = (formData.get("logo_url") as string) || null;

  const { error } = await supabase
    .from("coaches")
    .update({ name, brand_name: brandName, logo_url: logoUrl || null })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/coach/profile");
  revalidatePath("/coach/dashboard");
  return { success: true };
}
