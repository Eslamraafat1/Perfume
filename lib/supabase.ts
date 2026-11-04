import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./supabase-config";

export { supabaseConfig, isSupabaseConfigured, STORAGE_BUCKET } from "./supabase-config";

/**
 * Shared Supabase client, or `null` when Supabase is not configured (demo mode).
 *
 * - In the browser it is the @supabase/ssr browser client, which keeps the admin
 *   session in cookies so proxy.ts can check it on the server.
 * - On the server (sitemap, product metadata) it is a stateless client that only
 *   performs public, read-only queries.
 */
function createSupabase(): SupabaseClient | null {
  if (!supabaseConfig) return null;
  const { url, anonKey } = supabaseConfig;
  if (typeof window === "undefined") {
    return createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return createBrowserClient(url, anonKey);
}

export const supabase = createSupabase();

/** Returns the client for write operations, or throws a clear error in demo mode. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured: the demo catalogue is read-only. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
}
