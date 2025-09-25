// src/context/CartContext.jsx

import React, { createContext, useState, useContext } from 'react';

// Creamos el Contexto
const CartContext = createContext();

// Hook personalizado para facilitar el uso del contexto
export const useCart = () => {
  return useContext(CartContext);
};

// Componente Proveedor que envuelve la aplicación
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Función para AGREGAR productos al carrito
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        // Si ya existe, solo aumentamos la cantidad
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Si es nuevo, lo agregamos con cantidad 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Función para ELIMINAR un producto del carrito
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };
  
  // Función para LIMPIAR todo el carrito
  const clearCart = () => {
    setCartItems([]);
  };

  // Esto es lo que otros componentes podrán usar
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};