"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  badge?: string | null;
  category?: string;
  top_notes?: string;
  heart_notes?: string;
  base_notes?: string;
  longevity?: string;
  sillage?: string;
  created_at?: string;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, "id" | "created_at">) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error.message);
    } else {
      setProducts(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();

    // Real-time subscription — updates home page instantly when dashboard adds a product
    const channel = supabase
      .channel("products-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  const addProduct = async (product: Omit<Product, "id" | "created_at">) => {
    const { error } = await supabase.from("products").insert([product]);
    if (error) throw new Error(error.message);
    await fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await fetchProducts();
  };

  return (
    <ProductContext.Provider
      value={{ products, loading, addProduct, deleteProduct, refetch: fetchProducts }}
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
