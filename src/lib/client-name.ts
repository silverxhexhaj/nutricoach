import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Resolves client display names. When clients.name is null, fetches the user's
 * email from auth and uses the part before @ as the display name.
 */
export async function resolveClientDisplayNames<
  T extends { id: string; name: string | null; user_id?: string }
>(clients: T[]): Promise<(Omit<T, "user_id"> & { name: string | null })[]> {
  const needEmail = clients.filter((c) => !c.name && c.user_id);
  if (needEmail.length === 0) {
    return clients.map(({ user_id: _, ...c }) => ({ ...c, name: c.name }));
  }

  const emailByUserId: Record<string, string> = {};
  try {
    const admin = createAdminClient();
    await Promise.all(
      needEmail.map(async (c) => {
        if (!c.user_id) return;
        const { data } = await admin.auth.admin.getUserById(c.user_id);
        if (data?.user?.email) {
          emailByUserId[c.user_id] = data.user.email;
        }
      })
    );
  } catch {
    // Admin client not configured or fetch failed
  }

  return clients.map(({ user_id, ...c }) => ({
    ...c,
    name:
      c.name ??
      (user_id && emailByUserId[user_id]
        ? emailByUserId[user_id].split("@")[0]
        : null),
  }));
}
