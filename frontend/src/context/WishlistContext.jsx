import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('dyntra-wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      localStorage.removeItem('dyntra-wishlist');
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('dyntra-wishlist', JSON.stringify(items));
  }, [items]);

  const toggleWishlist = (product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) return prev.filter((i) => i.id !== product.id);
      return [...prev, product];
    });
  };

  const isInWishlist = (id) => items.some((i) => i.id === id);

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
