"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

export interface HeroSlide {
  id: string;
  sort_order: number;
  img: string;
  accent: string;
  gradient: string;
  glow: string;
  href: string;
  active: boolean;
  tag_en: string;
  tag_ar: string;
  eyebrow_en: string;
  eyebrow_ar: string;
  title1_en: string;
  title1_ar: string;
  title2_en: string;
  title2_ar: string;
  title3_en: string;
  title3_ar: string;
  subtitle_en: string;
  subtitle_ar: string;
  btn_text_en: string;
  btn_text_ar: string;
  created_at?: string;
}

/* Fallback slides used before DB loads or on error */
export const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "default-0",
    sort_order: 0,
    img: "/perfume_1.png",
    accent: "rgba(165,110,60,0.6)",
    gradient: "linear-gradient(135deg,#0a0519 0%,#1a0a2e 45%,#0f0820 100%)",
    glow: "rgba(200,140,80,0.35)",
    href: "/products",
    active: true,
    tag_en: "BEST SELLER",
    tag_ar: "الأكثر مبيعاً",
    eyebrow_en: "The Signature Collection",
    eyebrow_ar: "كولكشن سيجنيتشر",
    title1_en: "Eternal",
    title1_ar: "العود",
    title2_en: "Midnight",
    title2_ar: "الأبدي",
    title3_en: "Oud",
    title3_ar: "الغامض",
    subtitle_en: "A journey through ancient forests and midnight blooms — an oud so rich it lingers for days.",
    subtitle_ar: "رحلة عبر الغابات القديمة وزهور منتصف الليل — عود غني للغاية يدوم لأيام.",
    btn_text_en: "Explore Collection",
    btn_text_ar: "استكشف الكولكشن",
  },
  {
    id: "default-1",
    sort_order: 1,
    img: "/perfume_2.png",
    accent: "rgba(130,30,80,0.6)",
    gradient: "linear-gradient(135deg,#190514 0%,#2a0a1e 45%,#100a15 100%)",
    glow: "rgba(200,60,120,0.35)",
    href: "/products",
    active: true,
    tag_en: "NEW ARRIVAL",
    tag_ar: "وصل حديثاً",
    eyebrow_en: "Floral Elixir Series",
    eyebrow_ar: "سلسلة إكسير الزهور",
    title1_en: "Rose",
    title1_ar: "روز",
    title2_en: "Noir",
    title2_ar: "نوار",
    title3_en: "Absolut",
    title3_ar: "أبسولوت",
    subtitle_en: "Thousands of hand-picked roses distilled into a single devastating drop of pure luxury.",
    subtitle_ar: "آلاف الورود المقطوفة يدوياً والمقطرة في قطرة واحدة مذهلة من الفخامة الخالصة.",
    btn_text_en: "Discover Now",
    btn_text_ar: "اكتشف الآن",
  },
  {
    id: "default-2",
    sort_order: 2,
    img: "/perfume_3.png",
    accent: "rgba(200,180,100,0.5)",
    gradient: "linear-gradient(135deg,#0f0e08 0%,#1f1c0a 45%,#12100a 100%)",
    glow: "rgba(220,190,80,0.35)",
    href: "/products",
    active: true,
    tag_en: "LIMITED EDITION",
    tag_ar: "إصدار محدود",
    eyebrow_en: "The Celestial Range",
    eyebrow_ar: "كولكشن سيليستيال",
    title1_en: "White",
    title1_ar: "وايت",
    title2_en: "Amber",
    title2_ar: "آمبر",
    title3_en: "Accord",
    title3_ar: "أكورد",
    subtitle_en: "Warm musks meet crystalline amber in a composition that wraps you in an aura of pure elegance.",
    subtitle_ar: "المسك الدافئ يلتقي بالعنبر البلوري في تركيبة تغلفك بهالة من الأناقة الخالصة.",
    btn_text_en: "View Collection",
    btn_text_ar: "عرض الكولكشن",
  },
  {
    id: "default-3",
    sort_order: 3,
    img: "/perfume_4.png",
    accent: "rgba(30,90,180,0.5)",
    gradient: "linear-gradient(135deg,#050d1a 0%,#0a1830 45%,#060e1a 100%)",
    glow: "rgba(60,130,220,0.35)",
    href: "/products",
    active: true,
    tag_en: "EDITOR'S CHOICE",
    tag_ar: "اختيار المحرر",
    eyebrow_en: "Aqua Lumineuse",
    eyebrow_ar: "أكوا لومينيز",
    title1_en: "Blue",
    title1_ar: "بلو",
    title2_en: "Sapphire",
    title2_ar: "سافير",
    title3_en: "Marine",
    title3_ar: "مارين",
    subtitle_en: "Crisp sea breeze, aquatic neroli, and warm sandalwood — freedom distilled into a bottle.",
    subtitle_ar: "نسيم البحر المنعش، النيرولي المائي، وخشب الصندل الدافئ — الحرية مقطرة في زجاجة.",
    btn_text_en: "Shop Now",
    btn_text_ar: "تسوق الآن",
  },
];

interface HeroSlidesContextValue {
  slides: HeroSlide[];
  allSlides: HeroSlide[];
  loading: boolean;
  refetch: () => Promise<void>;
  addSlide: (
    slide: Omit<HeroSlide, "id" | "created_at">
  ) => Promise<void>;
  updateSlide: (
    id: string,
    updates: Partial<Omit<HeroSlide, "id" | "created_at">>
  ) => Promise<void>;
  deleteSlide: (id: string) => Promise<void>;
  reorderSlide: (id: string, direction: "up" | "down") => Promise<void>;
}

const HeroSlidesContext = createContext<HeroSlidesContextValue | null>(null);

export function HeroSlidesProvider({ children }: { children: ReactNode }) {
  const [allSlides, setAllSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setAllSlides(data as HeroSlide[]);
      } else {
        // Table exists but empty — keep defaults
        setAllSlides(DEFAULT_SLIDES);
      }
    } catch {
      // Table might not exist yet — use defaults silently
      setAllSlides(DEFAULT_SLIDES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addSlide = useCallback(
    async (slide: Omit<HeroSlide, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("hero_slides")
        .insert([slide])
        .select()
        .single();
      if (error) throw new Error(error.message);
      setAllSlides((prev) =>
        [...prev.filter((s) => !s.id.startsWith("default-")), data as HeroSlide].sort(
          (a, b) => a.sort_order - b.sort_order
        )
      );
    },
    []
  );

  const updateSlide = useCallback(
    async (id: string, updates: Partial<Omit<HeroSlide, "id" | "created_at">>) => {
      const { error } = await supabase
        .from("hero_slides")
        .update(updates)
        .eq("id", id);
      if (error) throw new Error(error.message);
      setAllSlides((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const deleteSlide = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("hero_slides")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    setAllSlides((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const reorderSlide = useCallback(
    async (id: string, direction: "up" | "down") => {
      const sorted = [...allSlides].sort((a, b) => a.sort_order - b.sort_order);
      const idx = sorted.findIndex((s) => s.id === id);
      if (idx === -1) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return;

      const current = sorted[idx];
      const swap = sorted[swapIdx];

      // Swap sort_orders
      await Promise.all([
        supabase
          .from("hero_slides")
          .update({ sort_order: swap.sort_order })
          .eq("id", current.id),
        supabase
          .from("hero_slides")
          .update({ sort_order: current.sort_order })
          .eq("id", swap.id),
      ]);

      setAllSlides((prev) =>
        prev.map((s) => {
          if (s.id === current.id) return { ...s, sort_order: swap.sort_order };
          if (s.id === swap.id) return { ...s, sort_order: current.sort_order };
          return s;
        })
      );
    },
    [allSlides]
  );

  /* Only show active slides to the carousel */
  const slides = allSlides
    .filter((s) => s.active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <HeroSlidesContext.Provider
      value={{
        slides,
        allSlides,
        loading,
        refetch,
        addSlide,
        updateSlide,
        deleteSlide,
        reorderSlide,
      }}
    >
      {children}
    </HeroSlidesContext.Provider>
  );
}

export function useHeroSlides() {
  const ctx = useContext(HeroSlidesContext);
  if (!ctx) throw new Error("useHeroSlides must be used inside HeroSlidesProvider");
  return ctx;
}
