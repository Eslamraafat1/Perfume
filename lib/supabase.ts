import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if URL is a valid URL starting with http:// or https://
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl! : "https://placeholder-url-please-set-in-env.supabase.co";
const supabaseAnonKey = rawKey && rawKey !== "your-anon-key-here" ? rawKey : "placeholder-anon-key";

if (!isValidUrl(rawUrl) || !rawKey || rawKey === "your-anon-key-here") {
  console.warn(
    "⚠️ WARNING: Supabase environment variables are missing or invalid.\n" +
    "Please update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name — must match what you created in Supabase Dashboard
export const STORAGE_BUCKET = "product-images";

