import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client with service role key.
 * Use only for server-side operations that need elevated privileges (e.g. auth.admin.inviteUserByEmail).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations");
  }
  return createClient(url, serviceRoleKey);
}
