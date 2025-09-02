import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../Css/ProducList.css';
import Icon from '../assets/casa-icono-silueta.png';
import Buscador from '../assets/buscar.png';



const ProductList = () => {
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
        { name: "Producto 1", description: "Descripcion del producto 1" },
        { name: "Producto 2", description: "Descripcion del producto 2" },
        { name: "Producto 3", description: "Descripcion del producto 3" },
        { name: "Producto 4", description: "Descripcion del producto 4" },
        { name: "Producto 5", description: "Descripcion del producto 5" },
        { name: "Producto 6", description: "Descripcion del producto 6" },
        { name: "Producto 7", description: "Descripcion del producto 7" },
        { name: "Producto 8", description: "Descripcion del producto 8" },
        { name: "Producto 9", description: "Descripcion del producto 9" },
        { name: "Producto 10", description: "Descripcion del producto 10" },
        { name: "Producto 11", description: "Descripcion del producto 11" },
        { name: "Producto 12", description: "Descripcion del producto 12" },
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
            <header className="header-container">
                <div className="navbar" onMouseLeave={handleMouseLeave}>
                    <Link to="/" className="nav-item home-icon-link">
                        <img src={Icon} alt="Inicio" className="home-icon" />
                    </Link>

                    {navItems.map((item) => (
                        <div
                            key={item.name}
                            className="nav-item-dropdown"
                            onMouseEnter={() => handleMouseEnter(item.name)}
                        >
                            <Link to={item.path} className={`nav-item`}>
                                {item.name}
                            </Link>
                            {hoveredMenu === item.name && (
                                <div className="dropdown-content">
                                    <div className="dropdown-inner">
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
                    <h2 className="category-title">Celulares</h2>
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
