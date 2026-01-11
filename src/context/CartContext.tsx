'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artistName: string;
  imageUrl: string;
  mockupUrl?: string;
  productType: 'poster' | 'canvas' | 'framed';
  size: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('katiaprints-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('katiaprints-cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (newItem: Omit<CartItem, 'id' | 'quantity'>) => {
    setItems(prev => {
      // Check if item already exists with same artwork, type, and size
      const existingIndex = prev.findIndex(
        item =>
          item.artworkId === newItem.artworkId &&
          item.productType === newItem.productType &&
          item.size === newItem.size
      );

      if (existingIndex >= 0) {
        // Increment quantity
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
          mockupUrl: newItem.mockupUrl || updated[existingIndex].mockupUrl,
        };
        return updated;
      }

      // Add new item
      return [...prev, {
        ...newItem,
        id: `${newItem.artworkId}-${newItem.productType}-${newItem.size}-${Date.now()}`,
        quantity: 1,
      }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
