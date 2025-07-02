import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existingItemIndex = prev.findIndex(
        (i) => i.name === item.name && i.restaurantId === item.restaurantId
      );
      if (existingItemIndex >= 0) {
        const updatedCart = [...prev];
        updatedCart[existingItemIndex].quantity += item.quantity || 1;
        return updatedCart;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const updateQuantity = (name, restaurantId, quantity) => {
    setCart((prev) => {
      const existingItemIndex = prev.findIndex(
        (i) => i.name === name && i.restaurantId === restaurantId
      );
      if (existingItemIndex >= 0) {
        const updatedCart = [...prev];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: Math.max(0, quantity), // Ensure quantity is not negative
        };
        return updatedCart;
      }
      return prev;
    });
  };

  const removeItem = (name, restaurantId) => {
    setCart((prev) => prev.filter((item) => !(item.name === name && item.restaurantId === restaurantId)));
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider value={{ cart, totalPrice, addToCart, clearCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => React.useContext(CartContext);