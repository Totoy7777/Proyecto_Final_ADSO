import React, { useState } from "react";
import { Link } from "react-router-dom";
import { categories } from "../data/categories";

// 1. IMPORTAMOS EL HOOK 'useCart' PARA CONECTARNOS AL CARRITO
import { useCart } from '../context/CartContext'; 

// Importamos todos los íconos
import { FaHome, FaLaptop, FaMobileAlt, FaTv, FaGamepad, FaHeadphones, FaSearch, FaUser, FaTimes, FaShoppingCart } from "react-icons/fa";
import "../Css/Menu.css";
import "../Css/Submenu.css";

// Mapeo de íconos para cada categoría
const categoryIcons = {
  computadores: <FaLaptop className="icon" />,
  celulares: <FaMobileAlt className="icon" />,
  tv: <FaTv className="icon" />,
  videojuegos: <FaGamepad className="icon" />,
  audio: <FaHeadphones className="icon" />,
};

const Menu = () => {
  // 2. OBTENEMOS LOS PRODUCTOS DEL CARRITO USANDO EL HOOK
  const { cartItems } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  // 3. CALCULAMOS EL TOTAL DE PRODUCTOS EN EL CARRITO
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="menu-container">
      <ul className="menu">
        <li>
          <Link to="/">
            <FaHome className="icon" />
            <span>Inicio</span>
          </Link>
        </li>

        {Object.keys(categories).map((categoryKey) => (
          <li key={categoryKey} className="has-submenu">
            <Link to={`/categoria/${categoryKey}`}>
              {categoryIcons[categoryKey]}
              <span>{categories[categoryKey].name}</span>
            </Link>
            <ul className="submenu">
              {Object.keys(categories[categoryKey].subcategories).map(
                (subcategoryKey) => (
                  <li key={subcategoryKey}>
                    <Link to={`/categoria/${categoryKey}/${subcategoryKey}`}>
                      {categories[categoryKey].subcategories[subcategoryKey]}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </li>
        ))}

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

        <li className="right-icons2">
          <Link to="/login">
            <FaUser className="icon" />
          </Link>
        </li>

        {/* 4. ACTUALIZAMOS EL CARRITO PARA QUE MUESTRE LA "BURBUJA" CON EL TOTAL */}
        <li className="right-icons3">
          <Link to="/carrito" className="cart-link">
            <FaShoppingCart className="icon" />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;