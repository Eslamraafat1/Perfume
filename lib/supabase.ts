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

const isPlaceholderUrl = (url: string | undefined): boolean => {
  if (!url) return true;
  return url.includes("placeholder-url-please-set-in-env") || url.includes("your-supabase-url");
};

const isPlaceholderKey = (key: string | undefined): boolean => {
  if (!key) return true;
  return key === "placeholder-anon-key" || key === "your-anon-key-here";
};

const supabaseUrl = isValidUrl(rawUrl) && !isPlaceholderUrl(rawUrl)
  ? rawUrl!
  : "https://oeatwkrkzqdiwkpzfzzf.supabase.co";

const supabaseAnonKey = rawKey && !isPlaceholderKey(rawKey)
  ? rawKey
  : "sb_publishable_lmOGDsQtCBU5jGrY5KXjhg_B7NZ-fY2";

if (!isValidUrl(rawUrl) || isPlaceholderUrl(rawUrl) || isPlaceholderKey(rawKey)) {
  console.log(
    "ℹ️ INFO: Supabase environment variables are missing or placeholders in process.env. Using fallback credentials."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name — must match what you created in Supabase Dashboard
export const STORAGE_BUCKET = "product-images";

