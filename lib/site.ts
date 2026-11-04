/**
 * Canonical site URL used for metadataBase, canonical links, sitemap and robots.
 *
 * Resolution order (never falls back to localhost in production):
 *   1. NEXT_PUBLIC_SITE_URL                    – explicit override
 *   2. VERCEL_PROJECT_PRODUCTION_URL           – set automatically by Vercel
 *   3. the known production deployment
 */
const PRODUCTION_URL = "https://perfume-sooty-alpha.vercel.app";

function resolveSiteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
      `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    PRODUCTION_URL;
  return fromEnv.replace(/\/+$/, "");
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Nubia Fine Fragrances";

/** Serialise JSON-LD safely for a <script> tag (escapes "<" to prevent XSS). */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
