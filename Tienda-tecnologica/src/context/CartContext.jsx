import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import {
  addItem as apiAddItem,
  updateItem as apiUpdateItem,
  removeItem as apiRemoveItem,
  getActiveCart,
  checkout as apiCheckout,
} from "../api/cart";

const CartContext = createContext();

const extractItems = (cartData) => {
  if (!cartData || !Array.isArray(cartData.items)) {
    return [];
  }
  return cartData.items.map((entry) => {
    const product = entry.product ?? {};
    const id = product.productId ?? product.id ?? entry.id;
    return {
      id,
      productId: id,
      name: product.name ?? entry.name ?? "Producto",
      price: Number(entry.precioUnitario ?? entry.price ?? product.price ?? 0),
      quantity: entry.cantidad ?? entry.quantity ?? 1,
      image: product.imageUrl ?? product.image ?? entry.image ?? "",
      product,
    };
  });
};

const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const syncCart = useCallback((cartData) => {
    setItems(extractItems(cartData));
    setCartId(cartData?.cartId ?? null);
    setError(null);
  }, []);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setItems([]);
      setCartId(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      const data = await getActiveCart(user.id);
      syncCart(data);
    } catch (err) {
      console.error("[CartContext] loadCart", err);
      setError("No fue posible cargar el carrito");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, syncCart]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleGuestAdd = useCallback((product, quantity) => {
    const id = product?.productId ?? product?.id;
    if (!id) {
      return;
    }
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === id);
      if (existing) {
        return prev.map((item) =>
          item.productId === id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id,
          productId: id,
          name: product.name ?? "Producto",
          price: Number(product.price ?? 0),
          quantity,
          image: product.imageUrl ?? "",
          product,
        },
      ];
    });
  }, []);

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!product) {
        console.warn("[CartContext] addToCart sin producto");
        return;
      }
      const productId = product.productId ?? product.id;
      if (!productId) {
        console.warn("[CartContext] producto sin id", product);
        return;
      }

      if (!isAuthenticated || !user?.id) {
        handleGuestAdd(product, quantity);
        return;
      }

      try {
        setLoading(true);
        const data = await apiAddItem({
          userId: user.id,
          productId,
          cantidad: quantity,
        });
        syncCart(data);
      } catch (err) {
        console.error("[CartContext] addToCart", err);
        setError("No fue posible agregar el producto al carrito");
      } finally {
        setLoading(false);
      }
    },
    [handleGuestAdd, isAuthenticated, syncCart, user?.id]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (!isAuthenticated || !user?.id) {
        setItems((prev) =>
          prev
            .map((item) =>
              item.productId === productId ? { ...item, quantity } : item
            )
            .filter((item) => item.quantity > 0)
        );
        return;
      }

      try {
        setLoading(true);
        const data = await apiUpdateItem({
          userId: user.id,
          productId,
          cantidad: quantity,
        });
        syncCart(data);
      } catch (err) {
        console.error("[CartContext] updateQuantity", err);
        setError("No fue posible actualizar el carrito");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, syncCart, user?.id]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      if (!isAuthenticated || !user?.id) {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
        return;
      }

      try {
        setLoading(true);
        const data = await apiRemoveItem({
          userId: user.id,
          productId,
        });
        syncCart(data);
      } catch (err) {
        console.error("[CartContext] removeFromCart", err);
        setError("No fue posible eliminar el producto");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, syncCart, user?.id]
  );

  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      await Promise.all(
        items.map((item) =>
          apiRemoveItem({ userId: user.id, productId: item.productId })
        )
      );
      await loadCart();
    } catch (err) {
      console.error("[CartContext] clearCart", err);
      setError("No fue posible limpiar el carrito");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, items, loadCart, user?.id]);

  const checkout = useCallback(
    async (payload) => {
      if (!isAuthenticated || !user?.id) {
        throw new Error("Debes iniciar sesión para finalizar la compra");
      }
      try {
        setLoading(true);
        const response = await apiCheckout({
          ...payload,
          userId: user.id,
        });
        await loadCart();
        return response;
      } catch (err) {
        console.error("[CartContext] checkout", err);
        const message =
          err?.response?.data ?? "No fue posible completar el pago";
        throw new Error(typeof message === "string" ? message : "Error de pago");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, loadCart, user?.id]
  );

  const total = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + Number(item.price ?? 0) * Number(item.quantity ?? 0),
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      cartItems: items,
      cartId,
      loading,
      error,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refresh: loadCart,
      checkout,
      total,
      isAuthenticated,
    }),
    [
      addToCart,
      cartId,
      checkout,
      clearCart,
      error,
      isAuthenticated,
      items,
      loadCart,
      loading,
      removeFromCart,
      total,
      updateQuantity,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  return useContext(CartContext);
};

export { CartProvider };
