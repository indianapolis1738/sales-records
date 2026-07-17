"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * 1. Cart Item type
 */
export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

/**
 * 2. Context shape
 */
type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * 3. Provider
 */
export const CartProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  /**
   * Load from localStorage on mount
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (err) {
        console.error("Invalid cart data in localStorage");
      }
    }
  }, []);

  /**
   * Save to localStorage whenever cart changes
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  /**
   * Add to cart (merge quantity if exists)
   */
  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);

      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  /**
   * Remove item completely
   */
  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  /**
   * Update quantity manually
   */
  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.id !== id);
      }

      return prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
    });
  };

  /**
   * Clear cart
   */
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/**
 * 4. Hook (THIS is what you use in components)
 */
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};