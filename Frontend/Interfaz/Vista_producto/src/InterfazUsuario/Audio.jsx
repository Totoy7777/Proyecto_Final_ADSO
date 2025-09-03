import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom'; // 👈 Importa 'Link'
import '../Css/ProducList.css';
import Icon from '../assets/casa-icono-silueta.png';
import Buscador from '../assets/buscar.png';



const ProductList = () => {
    // ... (El resto de tu código de estado y funciones es el mismo)
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [hoveredMenu, setHoveredMenu] = useState(null);
    const menuTimer = useRef(null);

    const handleMouseEnter = (itemName) => {
        clearTimeout(menuTimer.current);
        menuTimer.current = setTimeout(() => {
            setHoveredMenu(itemName);
        }, 200);
    };

    const handleMouseLeave = () => {
        clearTimeout(menuTimer.current);
        setHoveredMenu(null);
    };

    const toggleSearch = () => {
        setIsSearchVisible(!isSearchVisible);
    };

    const products = [
        { name: "Producto", description: "Descripcion" },
        // ... (Tu lista de productos completa)
        { name: "Producto", description: "Descripcion" },
        { name: "Producto", description: "Descripcion" },
        { name: "Producto", description: "Descripcion" },
        { name: "Producto", description: "Descripcion" },
        { name: "Producto", description: "Descripcion" },
        { name: "Producto", description: "Descripcion" },
        { name: "Producto", description: "Descripcion" },
        { name: "Producto", description: "Descripcion" },
        { name: "Producto", description: "Descripcion" },
        { name: "Producto", description: "Descripcion" },
        { name: "Producto", description: "Descripcion" },
    ];

    const navItems = [
        { name: "Computadores", path: "/computadores", leftColumn: [{ title: "Ver todos", options: ["Portátiles", "Escritorio", "Accesorios"] }], rightColumn: [{ options: [] }] },
        { name: "Celulares", path: "/celulares", leftColumn: [{ title: "Ver todos", options: ["Smartphones", "Básicos", "Accesorios"] }], rightColumn: [{ options: [] }] },
        { name: "Tv", path: "/tv", leftColumn: [{ title: "Ver todos", options: ["Smart TV", "LED", "Proyectores"] }], rightColumn: [{ options: [] }] },
        { name: "Videojuegos", path: "/videojuegos", leftColumn: [{ title: "Ver todos", options: ["Consolas", "Juegos", "Accesorios"] }], rightColumn: [{ options: [] }] },
        { name: "Audio", path: "/audio", leftColumn: [{ title: "Ver todos", options: ["Audífonos", "Parlantes", "Equipos de Sonido"] }], rightColumn: [{ options: [] }] },
    ];

    return (
        <div className={`product-page-container ${hoveredMenu ? 'menu-active' : ''}`}>
            {/* Header section */}
            <header className="header-container">
                {/* The entire navbar handles mouse events */}
                <div className="navbar" onMouseLeave={handleMouseLeave}>
                    <Link to="/" className="nav-item home-icon-link">
                        <img src={Icon} alt="Inicio" className="home-icon" />
                    </Link>

                    {/* Loop through navItems to create links with hover functionality */}
                    {navItems.map((item) => (
                        <div
                            key={item.name}
                            className="nav-item-dropdown"
                            onMouseEnter={() => handleMouseEnter(item.name)}
                        >
                            <Link to={item.path} className={`nav-item ${item.name === "Celulares" ? "active" : ""}`}>
                                {item.name}
                            </Link>
                            {/* Conditional rendering of the dropdown menu */}
                            {hoveredMenu === item.name && (
                                <div className="dropdown-content">
                                    <div className="dropdown-inner">
                                        {/* Left Column */}
                                        <div>
                                            {item.leftColumn.map((col, colIndex) => (
                                                <div key={colIndex} className="dropdown-column">
                                                    <p className="dropdown-column-title">{col.title}</p>
                                                    {col.options.map((option, optIndex) => (
                                                        <Link key={optIndex} to={item.path} className="dropdown-item">{option}</Link>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Right Column */}
                                        <div className="right-column">
                                            {item.rightColumn.map((col, colIndex) => (
                                                <div key={colIndex} className="dropdown-column">
                                                    <p className="dropdown-column-title">{col.title}</p>
                                                    {col.options.map((option, optIndex) => (
                                                        <Link key={optIndex} to={item.path} className="dropdown-item">{option}</Link>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {isSearchVisible ? (
                        <div className="search-container visible">
                            <input type="text" placeholder="Buscar..." className="search-input" />
                            <button className="search-button" onClick={toggleSearch}>❌</button>
                        </div>
                    ) : (
                        <button className="search-button" onClick={toggleSearch}>
                            <img src={Buscador} alt="Buscar" className="Buscador" />
                        </button>
                    )}
                </div>
            </header>
            
            <main className="main-content">
                <div className="category-header">
                    <h2 className="category-title">Audio</h2>
                    <select className="sort-dropdown">
                        <option>Ordenar por</option>
                        <option>Precio</option>
                        <option>Popularidad</option>
                    </select>
                </div>
                <div className="product-grid">
                    {products.map((product, index) => (
                        <div className="product-card" key={index}>
                            <div className="product-image-placeholder"></div>
                            <p className="product-name">{product.name}</p>
                            <p className="product-description">{product.description}</p>
                            <button className="buy-button">Comprar</button>
                        </div>
                    ))}
                </div>
            </main>
            
            <footer className="footer-container">
                <p>footer</p>
            </footer>
        </div>
    );
};

export default ProductList;