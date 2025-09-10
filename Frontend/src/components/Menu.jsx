import React, { useState } from "react";
import { Link } from "react-router-dom";
import { categories } from "../data/categories"; 
// Importa el ícono de cierre (FaTimes)
import { FaHome, FaLaptop, FaMobileAlt, FaTv, FaGamepad, FaHeadphones, FaSearch, FaUser, FaTimes } from "react-icons/fa";
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
 // Crea un estado para controlar la visibilidad de la barra de búsqueda
 const [isSearchOpen, setIsSearchOpen] = useState(false);

 // Función para alternar el estado de la barra de búsqueda
 const toggleSearch = () => {
 setIsSearchOpen(!isSearchOpen);
 };

 return (
  <nav className="menu-container">
 <ul className="menu">
 <li>
 <Link to="/">
 <FaHome className="icon" />
 <span>Inicio</span>
 </Link>
 </li>

 {/* Iteración sobre las categorías */}
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
 ))}
 </ul>
 </li>
 ))}

 {/* Renderiza la barra de búsqueda si isSearchOpen es true */}
 {isSearchOpen && (
 <li className="search-bar-container">
 <input type="text" placeholder="Buscar productos..." className="search-input" />
 <button onClick={toggleSearch} className="search-close-btn">
 <FaTimes />
 </button>
 </li>
 )}

 {/* Ícono de búsqueda */}
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
 </ul>
 </nav>
 );
};

export default Menu;