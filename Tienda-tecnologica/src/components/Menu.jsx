import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getCategories } from "../api/categories";
import {
  getCategoryKey,
  getCategorySlug,
  loadCategoriesFromCache,
  normalizeCategoryList,
  saveCategoriesToCache,
  splitCategoriesByParent,
  subscribeToCategoryUpdates,
  areCategoryListsEqual,
} from "../utils/categoryUtils";
import { normalizeName } from "../constants/categories";
import { FaHome, FaLaptop, FaMobileAlt, FaTv, FaGamepad, FaHeadphones, FaSearch, FaUser, FaTimes, FaShoppingCart, FaTools, FaTags, FaClipboardList, FaMoon, FaSun } from "react-icons/fa";
import "../Css/Menu.css";
import "../Css/Submenu.css";
import useDarkMode from "../hooks/useDarkMode";

const categoryIcons = {
  computadores: <FaLaptop className="icon" />,
  computadoras: <FaLaptop className="icon" />,
  celulares: <FaMobileAlt className="icon" />,
  tv: <FaTv className="icon" />,
  videojuegos: <FaGamepad className="icon" />,
  audio: <FaHeadphones className="icon" />,
};

const defaultCategoryIcon = <FaTags className="icon" />;

const Menu = () => {
  const { cartItems } = useCart();
  const { user, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const hideHomeLink = isAdmin || isSuperAdmin;
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categoryRecords, setCategoryRecords] = useState(() => loadCategoriesFromCache());
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);

  const { isDark, toggle } = useDarkMode();

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  const resolveSlug = (category) => {
    const slug = getCategorySlug(category);
    if (slug) return slug;
    const key = getCategoryKey(category);
    if (key != null) return String(key).toLowerCase();
    return normalizeName(category?.name ?? "categoria");
  };

  useEffect(() => {
    let mounted = true;

    const applyUpdate = (next) => {
      if (!mounted) return;
      const normalized = normalizeCategoryList(next);
      if (normalized.length === 0) {
        return;
      }
      setCategoryRecords((current) =>
        areCategoryListsEqual(current, normalized) ? current : normalized
      );
    };

    const unsubscribe = subscribeToCategoryUpdates(applyUpdate);

    const fetchData = async () => {
      setIsFetchingCategories(true);
      try {
        const data = await getCategories().catch(() => []);
        if (!mounted) return;
        const normalized = normalizeCategoryList(data);
        if (normalized.length > 0) {
          setCategoryRecords((current) =>
            areCategoryListsEqual(current, normalized) ? current : normalized
          );
          saveCategoriesToCache(normalized);
        } else {
          setCategoryRecords([]);
          saveCategoriesToCache([]);
        }
      } finally {
        if (mounted) {
          setIsFetchingCategories(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const { parents, subcategoriesByParent } = useMemo(
    () => splitCategoriesByParent(categoryRecords),
    [categoryRecords]
  );

  const navCategories = useMemo(
    () =>
      parents.map((parent) => {
        const parentId = getCategoryKey(parent);
        const parentSlug = resolveSlug(parent);
        const children = parentId != null ? subcategoriesByParent.get(String(parentId)) ?? [] : [];
        return {
          parent,
          slug: parentSlug,
          children: children.map((child) => ({
            record: child,
            slug: resolveSlug(child),
          })),
        };
      }),
    [parents, subcategoriesByParent]
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const firstName = user?.nombre ? user.nombre.split(" ")[0] : "";

  return (
    <nav className="menu-container">
      <ul className="menu">
        {!hideHomeLink && (
          <li>
            <Link to="/">
              <FaHome className="icon" />
              <span>Inicio</span>
            </Link>
          </li>
        )}

        {navCategories.length === 0 && isFetchingCategories && (
          <li style={{ color: "#6c757d", padding: "0.75rem 1rem" }}>Cargando categorías...</li>
        )}
        {navCategories.map(({ parent, slug, children }) => {
          const key = slug || String(getCategoryKey(parent) ?? parent.name);
          const icon = categoryIcons[slug] ?? defaultCategoryIcon;
          return (
            <li key={key} className={children.length > 0 ? "has-submenu" : undefined}>
              <Link to={`/categoria/${slug}`}>
                {icon}
                <span>{parent.name}</span>
              </Link>
              {children.length > 0 && (
                <ul className="submenu">
                  {children.map(({ record: child, slug: childSlug }) => (
                    <li key={`${childSlug}-${getCategoryKey(child) ?? child.name}`}>
                      <Link to={`/categoria/${slug}/${childSlug}`}>{child.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}

        {isSearchOpen && (
          <li className="search-bar-container">
            <input type="text" placeholder="Buscar productos..." className="search-input" />
            <button onClick={toggleSearch} className="search-close-btn">
              <FaTimes />
            </button>
          </li>
        )}

        {!isSearchOpen && (
          <li className="right-icons1">
            <Link onClick={toggleSearch}>
              <FaSearch className="icon" />
            </Link>
          </li>
        )}

        {isAuthenticated && !(isAdmin || isSuperAdmin) && (
          <li className="right-icons3">
            <Link to="/pedidos" className="user-link orders-link">
              <FaClipboardList className="icon" />
              <span className="user-label">Mis pedidos</span>
            </Link>
          </li>
        )}

        <li className="right-icons2">
          {isAuthenticated ? (
            <Link to="/perfil" className="user-link">
              <FaUser className="icon" />
              <span className="user-label">Hola, {firstName || "usuario"}</span>
            </Link>
          ) : (
            <Link to="/login">
              <FaUser className="icon" />
            </Link>
          )}
        </li>

        {(isAdmin || isSuperAdmin) && (
          <li className="right-icons-admin">
            <Link to="/admin/productos" className="admin-link">
              <FaTools className="icon" />
              <span>Productos</span>
            </Link>
            <Link to="/admin/pedidos" className="admin-link">
              <FaShoppingCart className="icon" />
              <span>Pedidos</span>
            </Link>
          </li>
        )}

        {/* 4. ACTUALIZAMOS EL CARRITO PARA QUE MUESTRE LA "BURBUJA" CON EL TOTAL */}
        {!(isAdmin || isSuperAdmin) && (
          <li className="right-icons3">
            <Link to="/carrito" className="cart-link">
              <FaShoppingCart className="icon" />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
          </li>
        )}

        {/* Botón de modo oscuro/claro */}
        <li className="right-icons3">
          <button type="button" className="theme-toggle" onClick={toggle} aria-label="Cambiar tema">
            {isDark ? <FaSun className="icon" /> : <FaMoon className="icon" />}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
