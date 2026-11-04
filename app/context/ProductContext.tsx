"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase, requireSupabase } from "@/lib/supabase";
import { loadProducts, type CatalogueSource } from "@/lib/catalogue";

export type ProductGender = "men" | "women" | "unisex" | "oriental";

export type FragranceFamily =
  | "Floral"
  | "Woody"
  | "Oriental & Spicy"
  | "Fresh & Citrus"
  | "Oud & Amber"
  | "Aquatic & Marine"
  | "Gourmand & Sweet"
  | "Musk & Powdery"
  | "Green & Aromatic"
  | "Chypre";

export const FRAGRANCE_FAMILIES: FragranceFamily[] = [
  "Floral",
  "Woody",
  "Oriental & Spicy",
  "Fresh & Citrus",
  "Oud & Amber",
  "Aquatic & Marine",
  "Gourmand & Sweet",
  "Musk & Powdery",
  "Green & Aromatic",
  "Chypre",
];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  badge?: string | null;
  category?: string;
  gender?: ProductGender;
  fragrance_family?: FragranceFamily | string;
  top_notes?: string;
  heart_notes?: string;
  base_notes?: string;
  longevity?: string;
  sillage?: string;
  sizes?: { size: string; price: number }[];
  images?: string[];
  video_url?: string;
  created_at?: string;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  /** Where the catalogue came from: Supabase, or the bundled demo catalogue. */
  source: CatalogueSource;
  isDemo: boolean;
  addProduct: (product: Omit<Product, "id" | "created_at">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<CatalogueSource>(supabase ? "supabase" : "demo");

  const fetchProducts = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const result = await loadProducts();
      setSource(result.source);
      setProducts((prev) => {
        if (prev.length === result.products.length && JSON.stringify(prev) === JSON.stringify(result.products)) {
          return prev;
        }
        return result.products;
      });
      return result.source;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    fetchProducts(true).then((loadedFrom) => {
      // Real-time updates only make sense when the catalogue really comes from Supabase.
      if (cancelled || loadedFrom !== "supabase" || !supabase) return;
      const client = supabase;
      const channel = client
        .channel("products-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
          fetchProducts(false);
        })
        .subscribe();
      unsubscribe = () => {
        client.removeChannel(channel);
      };
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [fetchProducts]);

  const addProduct = async (product: Omit<Product, "id" | "created_at">) => {
    const { error } = await requireSupabase().from("products").insert([product]);
    if (error) throw new Error(error.message);
    await fetchProducts();
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    const { error } = await requireSupabase().from("products").update(product).eq("id", id);
    if (error) throw new Error(error.message);
    await fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await requireSupabase().from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await fetchProducts();
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        source,
        isDemo: source === "demo",
        addProduct,
        updateProduct,
        deleteProduct,
        refetch: async () => {
          await fetchProducts();
        },
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider");
  return ctx;
}
