import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(undefined);
const STORAGE_KEY = "tienda_auth_state";

const getInitialState = () => {
  if (typeof window === "undefined") {
    return { user: null, authHeader: null };
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { user: null, authHeader: null };
    }
    const parsed = JSON.parse(stored);
    return {
      user: parsed?.user ?? null,
      authHeader: parsed?.authHeader ?? null,
    };
  } catch (error) {
    console.warn("No se pudo leer el estado de auth almacenado", error);
    return { user: null, authHeader: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(getInitialState);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (state.user && state.authHeader) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [state]);

  const login = ({ email, password }, payload) => {
    if (!payload?.success) {
      return;
    }
    const token = window.btoa(`${email}:${password}`);
    const authHeader = `Basic ${token}`;
    const user = {
      id: payload.userId,
      nombre: payload.nombre,
      email: payload.email,
      isAdmin: Boolean(payload.admin),
      isSuperAdmin: Boolean(payload.superAdmin),
    };
    setState({ user, authHeader });
  };

  const logout = () => {
    setState({ user: null, authHeader: null });
  };

  const value = useMemo(
    () => ({
      user: state.user,
      authHeader: state.authHeader,
      isAuthenticated: Boolean(state.user),
      isAdmin: Boolean(state.user?.isAdmin),
      isSuperAdmin: Boolean(state.user?.isSuperAdmin),
      login,
      logout,
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
