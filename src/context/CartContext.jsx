// ✅ CONTEXTO DE CARRITO (context/CartContext.js)
// context/CartContext.js
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => [...prev, item]);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart"); // 🔥 esto evita que "reviva"
  };

  const cartCount = cart.length;

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
