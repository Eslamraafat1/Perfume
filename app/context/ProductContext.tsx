"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // base64 or URL
  badge?: string;
  createdAt: number;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  deleteProduct: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | null>(null);

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "default-1",
    name: "Noir Absolu",
    description: "A mysterious blend of dark oud, black pepper, and vetiver. An intense journey into the night.",
    price: 185,
    image: "/perfume_1.png",
    badge: "Bestseller",
    createdAt: Date.now() - 5000,
  },
  {
    id: "default-2",
    name: "Rose Éternelle",
    description: "A timeless rose bouquet with fresh bergamot and warm sandalwood base. Pure elegance.",
    price: 210,
    image: "/perfume_2.png",
    badge: "New",
    createdAt: Date.now() - 4000,
  },
  {
    id: "default-3",
    name: "Oud Royale",
    description: "The finest aged oud from Arabia, wrapped in amber and precious spices. A royal statement.",
    price: 295,
    image: "/perfume_3.png",
    badge: "Exclusive",
    createdAt: Date.now() - 3000,
  },
  {
    id: "default-4",
    name: "Blanche Lumière",
    description: "A luminous white floral with jasmine, white musk and delicate powdery notes. Pure serenity.",
    price: 165,
    image: "/perfume_4.png",
    createdAt: Date.now() - 2000,
  },
  {
    id: "default-5",
    name: "Aqua Profondo",
    description: "An oceanic freshness with sea salt, cedar, and cool marine accords. The freedom of open water.",
    price: 145,
    image: "/perfume_5.png",
    createdAt: Date.now() - 1000,
  },
];

const STORAGE_KEY = "maison_luxe_products";

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Product[] = JSON.parse(stored);
        // merge: default products not in stored + stored user-added
        const userAdded = parsed.filter((p) => !p.id.startsWith("default-"));
        setProducts([...DEFAULT_PRODUCTS, ...userAdded]);
      } else {
        setProducts(DEFAULT_PRODUCTS);
      }
    } catch {
      setProducts(DEFAULT_PRODUCTS);
    }
  }, []);

  const persist = (list: Product[]) => {
    // only persist user-added
    const userAdded = list.filter((p) => !p.id.startsWith("default-"));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userAdded));
  };

  const addProduct = (product: Omit<Product, "id" | "createdAt">) => {
    const newProduct: Product = {
      ...product,
      id: `user-${Date.now()}`,
      createdAt: Date.now(),
    };
    setProducts((prev) => {
      const next = [...prev, newProduct];
      persist(next);
      return next;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persist(next);
      return next;
    });
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider");
  return ctx;
}
