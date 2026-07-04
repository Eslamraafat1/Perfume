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

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl! : "https://oeatwkrkzqdiwkpzfzzf.supabase.co";
const supabaseAnonKey = rawKey && rawKey !== "your-anon-key-here" ? rawKey : "sb_publishable_lmOGDsQtCBU5jGrY5KXjhg_B7NZ-fY2";

if (!isValidUrl(rawUrl) || !rawKey || rawKey === "your-anon-key-here") {
  console.log(
    "ℹ️ INFO: Supabase environment variables are missing in process.env. Using fallback credentials."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name — must match what you created in Supabase Dashboard
export const STORAGE_BUCKET = "product-images";

