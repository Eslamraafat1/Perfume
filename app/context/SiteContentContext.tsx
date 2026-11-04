"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase, requireSupabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload-client";

import { defaultTranslations } from "./defaultTranslations";

export const SITE_CONTENT_DEFAULTS = defaultTranslations;

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
    if (!supabase) {
      // Demo mode: the built-in copy (defaultTranslations) is the content.
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("key, value")
        .abortSignal(AbortSignal.timeout(6000));
      if (error) throw error;

      if (data && data.length > 0) {
        const map: SiteContentMap = { ...SITE_CONTENT_DEFAULTS };
        data.forEach(({ key, value }: { key: string; value: string }) => {
          map[key] = value;
        });
        setContent((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(map)) return prev;
          return map;
        });
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
    const client = requireSupabase();
    // Optimistic update
    setContent((prev) => ({ ...prev, [key]: value }));

    const { error } = await client
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

      const imageUrl = await uploadImage(file, fileName);
      await update(key, imageUrl);
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
