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
const GUEST_CART_KEY = "tienda_cart_guest_v1";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const serializeGuestItem = (item) => ({
  productId: item.productId,
  name: item.name,
  price: toNumber(item.price),
  quantity: toNumber(item.quantity, 1),
  image: item.image,
  product: item.product ?? null,
});

const loadGuestItems = () => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((entry) => {
        const productId = entry?.productId ?? entry?.id;
        if (!productId) {
          return null;
        }
        return {
          id: productId,
          productId,
          name: entry?.name ?? "Producto",
          price: toNumber(entry?.price),
          quantity: toNumber(entry?.quantity, 1),
          image: entry?.image ?? "",
          product: entry?.product ?? null,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.warn("[CartContext] guest cart corrupted", error);
    return [];
  }
};

const persistGuestItems = (items) => {
  if (typeof window === "undefined") {
    return;
  }
  if (!Array.isArray(items) || items.length === 0) {
    window.localStorage.removeItem(GUEST_CART_KEY);
    return;
  }
  const serialized = items
    .filter((item) => item?.productId)
    .map(serializeGuestItem);
  if (serialized.length === 0) {
    window.localStorage.removeItem(GUEST_CART_KEY);
    return;
  }
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(serialized));
};

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
  const { user, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const isStaff = isAdmin || isSuperAdmin;
  const [items, setItems] = useState(() => (isStaff ? [] : loadGuestItems()));
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const syncCart = useCallback((cartData) => {
    setItems(extractItems(cartData));
    setCartId(cartData?.cartId ?? null);
    setError(null);
  }, []);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated || !user?.id || isStaff) {
      setItems(isStaff ? [] : loadGuestItems());
      setCartId(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      const guestItems = loadGuestItems();
      let data = await getActiveCart(user.id);
      console.log("[CartContext] loadCart fetched", data);

      if (guestItems.length > 0) {
        for (const item of guestItems) {
          try {
            data = await apiAddItem({
              userId: user.id,
              productId: item.productId,
              cantidad: item.quantity,
            });
          } catch (addError) {
            console.warn("[CartContext] migrate guest item failed", addError);
          }
        }
        persistGuestItems([]);
      }

      syncCart(data);
    } catch (err) {
      console.error("[CartContext] loadCart", err);
      setError("No fue posible cargar el carrito");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isStaff, user?.id, syncCart]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (!isAuthenticated) {
      persistGuestItems(items);
      return;
    }
    if (isStaff) {
      persistGuestItems([]);
      return;
    }
    persistGuestItems([]);
  }, [items, isAuthenticated, isStaff]);

  const handleGuestAdd = useCallback((product, quantity) => {
    const id = product?.productId ?? product?.id;
    if (!id) {
      return;
    }

    const rawStock = Number(product?.stock ?? product?.inventario ?? Infinity);
    const stockLimit = Number.isFinite(rawStock) && rawStock >= 0 ? rawStock : Infinity;
    let stockExceeded = false;

    setItems((prev) => {
      const existing = prev.find((item) => item.productId === id);
      if (existing) {
        const desired = existing.quantity + quantity;
        const nextQuantity =
          stockLimit === Infinity ? desired : Math.min(desired, stockLimit);
        if (nextQuantity === existing.quantity) {
          stockExceeded = true;
          return prev;
        }
        if (nextQuantity < desired) {
          stockExceeded = true;
        }
        return prev.map((item) =>
          item.productId === id ? { ...item, quantity: nextQuantity } : item
        );
      }

      const initialQuantity =
        stockLimit === Infinity ? quantity : Math.min(quantity, stockLimit);
      if (initialQuantity <= 0) {
        stockExceeded = true;
        return prev;
      }
      if (initialQuantity < quantity) {
        stockExceeded = true;
      }
      return [
        ...prev,
        {
          id,
          productId: id,
          name: product.name ?? "Producto",
          price: Number(product.price ?? 0),
          quantity: initialQuantity,
          image: product.imageUrl ?? "",
          product,
        },
      ];
    });

    if (stockExceeded) {
      setError("No hay stock suficiente para agregar más unidades de este producto");
    } else {
      setError(null);
    }
  }, []);

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!product) {
        console.warn("[CartContext] addToCart sin producto");
        return false;
      }
      const productId = product.productId ?? product.id;
      if (!productId) {
        console.warn("[CartContext] producto sin id", product);
        return false;
      }

      if (isStaff) {
        setError("El carrito está disponible solo para usuarios clientes.");
        return false;
      }

      if (!isAuthenticated || !user?.id) {
        handleGuestAdd(product, quantity);
        return true;
      }

      try {
        setLoading(true);
        const data = await apiAddItem({
          userId: user.id,
          productId,
          cantidad: quantity,
        });
        console.log("[CartContext] addToCart response", data);
        syncCart(data);
        return true;
      } catch (err) {
        console.error("[CartContext] addToCart", err);
        const raw = err?.response?.data;
        const message = typeof raw === "string" && raw.trim() ? raw : "No fue posible agregar el producto al carrito";
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleGuestAdd, isAuthenticated, isStaff, syncCart, user?.id]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (isStaff) {
        setError("El carrito está disponible solo para usuarios clientes.");
        return;
      }
      if (!isAuthenticated || !user?.id) {
        let clamped = false;
        setItems((prev) =>
          prev
            .map((item) => {
              if (item.productId !== productId) {
                return item;
              }
              const rawStock = Number(item.product?.stock ?? Infinity);
              const stockLimit =
                Number.isFinite(rawStock) && rawStock >= 0 ? rawStock : Infinity;
              const safeQuantity = Math.max(
                0,
                stockLimit === Infinity ? quantity : Math.min(quantity, stockLimit)
              );
              if (safeQuantity !== quantity) {
                clamped = true;
              }
              return { ...item, quantity: safeQuantity };
            })
            .filter((item) => item.quantity > 0)
        );
        if (clamped) {
          setError("No hay stock suficiente para la cantidad indicada");
        } else {
          setError(null);
        }
        return;
      }

      try {
        setLoading(true);
        const data = await apiUpdateItem({
          userId: user.id,
          productId,
          cantidad: quantity,
        });
        console.log("[CartContext] updateQuantity response", data);
        syncCart(data);
      } catch (err) {
        console.error("[CartContext] updateQuantity", err);
        const raw = err?.response?.data;
        const message = typeof raw === "string" && raw.trim() ? raw : "No fue posible actualizar el carrito";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, isStaff, syncCart, user?.id]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      if (isStaff) {
        setError("El carrito está disponible solo para usuarios clientes.");
        return;
      }
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
        console.log("[CartContext] removeFromCart response", data);
        syncCart(data);
      } catch (err) {
        console.error("[CartContext] removeFromCart", err);
        setError("No fue posible eliminar el producto");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, isStaff, syncCart, user?.id]
  );

  const clearCart = useCallback(async () => {
    if (isStaff) {
      setItems([]);
      setError("El carrito está disponible solo para usuarios clientes.");
      return;
    }
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
  }, [isAuthenticated, isStaff, items, loadCart, user?.id]);

  const checkout = useCallback(
    async (payload) => {
      if (isStaff) {
        throw new Error("El carrito está disponible solo para usuarios clientes.");
      }
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
    [isAuthenticated, isStaff, loadCart, user?.id]
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
