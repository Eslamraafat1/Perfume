import type { Product } from "@/app/context/ProductContext";

/**
 * Demo catalogue — used when Supabase is not configured or cannot be reached.
 *
 * Rows have exactly the same shape as `public.products` (see supabase-setup.sql),
 * so every page works the same way in both modes. Nubia is a fictional brand:
 * each product is named after the label on its bottle in the product photos that
 * ship with the site (public/perfume_*.png). Prices are illustrative, in EGP.
 * There are deliberately no ratings or reviews.
 */
export const DEMO_PRODUCTS: Product[] = [
  {
    id: "29849ccc-14d1-4c1d-96db-11667d5569e2",
    name: "Oud Noir",
    description:
      "An extrait de parfum built around smoky oud. Saffron and cardamom open onto Bulgarian rose, settling into a deep base of oud, amber and leather.",
    price: 2400,
    image_url: "/perfume_3.png",
    badge: "Signature",
    category: "Oud & Woody",
    gender: "men",
    fragrance_family: "Oud & Amber",
    top_notes: "Saffron, Cardamom",
    heart_notes: "Bulgarian Rose, Incense",
    base_notes: "Oud, Amber, Leather",
    longevity: "Very Long Lasting (8h-12h)",
    sillage: "Strong",
    sizes: [
      { size: "50ml", price: 2400 },
      { size: "100ml", price: 3600 },
    ],
    images: [],
    created_at: "2026-06-06T10:00:00Z",
  },
  {
    id: "8427325c-dd11-4d2d-b864-abb01dfcfc8a",
    name: "Rose Noir",
    description:
      "A dark, velvety rose. Turkish rose absolute is wrapped in blackcurrant and pink pepper, then warmed by patchouli and vanilla.",
    price: 1500,
    image_url: "/perfume_2.png",
    badge: null,
    category: "Sweet & Floral",
    gender: "women",
    fragrance_family: "Floral",
    top_notes: "Blackcurrant, Pink Pepper",
    heart_notes: "Turkish Rose Absolute, Peony",
    base_notes: "Patchouli, Vanilla, Musk",
    longevity: "Long Lasting (6h-8h)",
    sillage: "Moderate",
    sizes: [
      { size: "50ml", price: 1500 },
      { size: "100ml", price: 2250 },
    ],
    images: [],
    created_at: "2026-06-05T10:00:00Z",
  },
  {
    id: "ff17507c-6f62-4879-ac4f-17401221815b",
    name: "Aurélia",
    description:
      "A golden floral eau de parfum. Bright Italian bergamot meets jasmine and orange blossom over a soft trail of Madagascar vanilla and amber.",
    price: 1350,
    image_url: "/perfume_1.png",
    badge: null,
    category: "Sweet & Floral",
    gender: "women",
    fragrance_family: "Floral",
    top_notes: "Italian Bergamot, Pear",
    heart_notes: "Jasmine, Orange Blossom",
    base_notes: "Madagascar Vanilla, Amber",
    longevity: "Long Lasting (6h-8h)",
    sillage: "Moderate",
    sizes: [
      { size: "50ml", price: 1350 },
      { size: "100ml", price: 1950 },
    ],
    images: [],
    created_at: "2026-06-04T10:00:00Z",
  },
  {
    id: "086c591a-0670-4eb9-8fcd-230ebc4dbaf6",
    name: "Aurora Gold",
    description:
      "A warm oriental composition. Cinnamon and clove glow over a heart of frankincense, resting on amber, tonka bean and sandalwood.",
    price: 1900,
    image_url: "/perfume_hero.png",
    badge: null,
    category: "Oriental Spice",
    gender: "oriental",
    fragrance_family: "Oriental & Spicy",
    top_notes: "Cinnamon, Clove",
    heart_notes: "Frankincense, Orris",
    base_notes: "Amber, Tonka Bean, Sandalwood",
    longevity: "Very Long Lasting (8h-12h)",
    sillage: "Strong",
    sizes: [
      { size: "50ml", price: 1900 },
      { size: "100ml", price: 2800 },
    ],
    images: [],
    created_at: "2026-06-03T10:00:00Z",
  },
  {
    id: "98097c6a-b8fa-44ff-8476-3f1d148c4ba9",
    name: "Aquatica Luxe",
    description:
      "A fresh aquatic scent for him and her. Sea notes and grapefruit lead into neroli and sage, drying down to cedar and white musk.",
    price: 1250,
    image_url: "/perfume_5.png",
    badge: null,
    category: "Fresh & Citrus",
    gender: "unisex",
    fragrance_family: "Aquatic & Marine",
    top_notes: "Sea Notes, Grapefruit",
    heart_notes: "Neroli, Sage",
    base_notes: "Cedar, White Musk",
    longevity: "Moderate (4h-6h)",
    sillage: "Moderate",
    sizes: [
      { size: "50ml", price: 1250 },
      { size: "100ml", price: 1850 },
    ],
    images: [],
    created_at: "2026-06-02T10:00:00Z",
  },
  {
    id: "15152fe3-c7fc-47ea-942a-b10c5ba1b822",
    name: "Été",
    description:
      "A clean summer musk. Lemon and mandarin sparkle over white tea and lily of the valley, finishing on soft musk and vetiver.",
    price: 750,
    image_url: "/perfume_4.png",
    badge: "New",
    category: "Fresh & Citrus",
    gender: "unisex",
    fragrance_family: "Fresh & Citrus",
    top_notes: "Lemon, Mandarin",
    heart_notes: "White Tea, Lily of the Valley",
    base_notes: "White Musk, Haitian Vetiver",
    longevity: "Moderate (4h-6h)",
    sillage: "Soft",
    sizes: [
      { size: "30ml", price: 750 },
      { size: "50ml", price: 1150 },
      { size: "100ml", price: 1750 },
    ],
    images: [],
    created_at: "2026-06-01T10:00:00Z",
  },
];
