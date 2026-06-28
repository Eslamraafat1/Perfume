"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category?: string;
  quantity: number;
  size?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: Omit<CartItem, "quantity">, size?: string) => void;
  removeFromCart: (id: string, size?: string) => void;
  updateQty: (id: string, qty: number, size?: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("maison-luxe-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("maison-luxe-cart", JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const addToCart = useCallback((product: Omit<CartItem, "quantity">, size = "50ml") => {
    setItems((prev) => {
      const key = `${product.id}-${size}`;
      const existing = prev.find((i) => `${i.id}-${i.size}` === key);
      if (existing) {
        return prev.map((i) =>
          `${i.id}-${i.size}` === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1, size }];
    });
  }, []);

  const removeFromCart = useCallback((id: string, size?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.id === id && (size === undefined || i.size === size)))
    );
  }, []);

  const updateQty = useCallback((id: string, qty: number, size?: string) => {
    if (qty <= 0) {
      removeFromCart(id, size);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && (size === undefined || i.size === size) ? { ...i, quantity: qty } : i
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, addToCart, removeFromCart, updateQty, clearCart, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
