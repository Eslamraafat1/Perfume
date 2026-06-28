"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";

/* ─── Default values (shown before Supabase loads) ─── */
export const SITE_CONTENT_DEFAULTS: Record<string, string> = {
  // Hero
  hero_image: "/perfume_hero.png",
  hero_eyebrow: "Luxury Niche Perfumery · Est. 2016",
  hero_title_1: "The Art of",
  hero_title_2: "Invisible",
  hero_title_3: "Beauty",
  hero_subtitle:
    "Crafted from the world's rarest botanical essences. Each Maison Luxe fragrance is a 90-day macerated masterpiece — long-lasting, deeply complex, unforgettable.",
  hero_btn_primary: "Explore Collection ✦",
  hero_btn_secondary: "Our Story →",

  // Category 1 — Oud & Woody
  cat1_name: "Oud & Woody",
  cat1_sub: "Dark · Resinous · Smoky",
  cat1_image: "/perfume_3.png",
  cat1_slug: "Oud & Woody",

  // Category 2 — Sweet & Floral
  cat2_name: "Sweet & Floral",
  cat2_sub: "Romantic · Powdery · Warm",
  cat2_image: "/perfume_2.png",
  cat2_slug: "Sweet & Floral",

  // Category 3 — Fresh & Citrus
  cat3_name: "Fresh & Citrus",
  cat3_sub: "Bright · Zesty · Aquatic",
  cat3_image: "/perfume_5.png",
  cat3_slug: "Fresh & Citrus",

  // Category 4 — Oriental Spice
  cat4_name: "Oriental Spice",
  cat4_sub: "Warm · Exotic · Mysterious",
  cat4_image: "/perfume_1.png",
  cat4_slug: "Oriental Spice",
};

type SiteContentMap = Record<string, string>;

interface SiteContentContextValue {
  content: SiteContentMap;
  loading: boolean;
  get: (key: string) => string;
  update: (key: string, value: string) => Promise<void>;
  uploadImageAndUpdate: (key: string, file: File) => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContentMap>(SITE_CONTENT_DEFAULTS);
  const [loading, setLoading] = useState(true);

  /* ── Fetch all site_content rows ── */
  const fetchContent = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("site_content").select("key, value");
      if (error) throw error;

      if (data && data.length > 0) {
        const map: SiteContentMap = { ...SITE_CONTENT_DEFAULTS };
        data.forEach(({ key, value }: { key: string; value: string }) => {
          map[key] = value;
        });
        setContent(map);
      }
    } catch (err) {
      console.warn("SiteContent: failed to fetch, using defaults.", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  /* ── Get helper ── */
  const get = useCallback(
    (key: string) => content[key] ?? SITE_CONTENT_DEFAULTS[key] ?? "",
    [content]
  );

  /* ── Update a single text value ── */
  const update = useCallback(async (key: string, value: string) => {
    // Optimistic update
    setContent((prev) => ({ ...prev, [key]: value }));

    const { error } = await supabase
      .from("site_content")
      .upsert({ key, value }, { onConflict: "key" });

    if (error) {
      console.error("SiteContent update error:", error);
      throw new Error(error.message);
    }
  }, []);

  /* ── Upload image to Storage → save public URL ── */
  const uploadImageAndUpdate = useCallback(
    async (key: string, file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      // Always unique name — no need for upsert/UPDATE permission
      const fileName = `site/${key}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,          // always new file → only needs INSERT policy
          contentType: file.type,
        });

      if (uploadError) {
        console.error("[SiteContent] Storage upload error:", uploadError);
        throw new Error(`Upload error: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
      await update(key, urlData.publicUrl);
    },
    [update]
  );

  return (
    <SiteContentContext.Provider value={{ content, loading, get, update, uploadImageAndUpdate }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error("useSiteContent must be used inside SiteContentProvider");
  return ctx;
}
