/**
 * Supabase connection settings, read ONLY from the environment.
 *
 * Both values are public (they ship to every browser); access control is enforced
 * by Row Level Security in Postgres (see supabase-setup.sql). When either value is
 * missing or still a placeholder, `supabaseConfig` is `null` and the store runs on
 * the bundled demo catalogue (data/demo-catalogue.ts) in read-only mode.
 *
 * This module has no side effects, so it is safe to import from proxy.ts.
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const PLACEHOLDER_URLS = ["your-project-ref", "placeholder-url-please-set-in-env", "your-supabase-url"];
const PLACEHOLDER_KEYS = ["your-anon-or-publishable-key", "placeholder-anon-key", "your-anon-key-here"];

function readConfig(): SupabaseConfig | null {
  // Referenced literally so Next.js can inline the NEXT_PUBLIC_* values at build time.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  if (PLACEHOLDER_URLS.some((p) => url.includes(p)) || PLACEHOLDER_KEYS.includes(anonKey)) return null;
  try {
    const { protocol } = new URL(url);
    if (protocol !== "https:" && protocol !== "http:") return null;
  } catch {
    return null;
  }
  return { url: url.replace(/\/+$/, ""), anonKey };
}

export const supabaseConfig = readConfig();
export const isSupabaseConfigured = supabaseConfig !== null;

/** Storage bucket for product / site images (must match supabase-setup.sql). */
export const STORAGE_BUCKET = "product-images";
