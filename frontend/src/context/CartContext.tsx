import { createContext, useContext, useState, ReactNode } from 'react';
import { License } from '../types';

interface CartContextType {
  items: License[];
  addToCart: (license: License) => void;
  removeFromCart: (licenseId: string) => void;
  clearCart: () => void;
  isInCart: (licenseId: string) => boolean;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<License[]>([]);

  const addToCart = (license: License) => {
    if (!isInCart(license.id)) {
      setItems((prev) => [...prev, license]);
    }
  };

  const removeFromCart = (licenseId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== licenseId));
  };

  const clearCart = () => setItems([]);

  const isInCart = (licenseId: string) => items.some((item) => item.id === licenseId);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isInCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
