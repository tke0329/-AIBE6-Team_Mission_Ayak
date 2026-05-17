import type { SupabaseClient, User } from "@supabase/supabase-js";

const AUTH_USER_TIMEOUT_MS = 1200;

export async function getAuthUserWithTimeout(
  supabase: SupabaseClient,
  timeoutMs = AUTH_USER_TIMEOUT_MS,
): Promise<User | null> {
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("AUTH_USER_TIMEOUT"));
        }, timeoutMs);
      }),
    ]);

    return result.data.user ?? null;
  } catch {
    return null;
  }
}
