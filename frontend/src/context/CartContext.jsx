import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('dyntra-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      localStorage.removeItem('dyntra-cart');
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('dyntra-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      const maxStock = Number(product.stock ?? 99);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, maxStock);
        if (newQty <= existing.quantity) return prev;
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: newQty } : i
        );
      }
      if (maxStock <= 0) return prev;
      return [...prev, { ...product, quantity: Math.min(qty, maxStock) }];
    });
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) return removeFromCart(id);
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const max = i.stock != null ? Number(i.stock) : quantity;
        return { ...i, quantity: Math.min(quantity, max) };
      })
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
