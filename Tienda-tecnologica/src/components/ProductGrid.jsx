// src/components/ProductGrid.jsx

import React from 'react';
import '../Css/ProductGrid.css'; // Sus nuevos estilos

// Importa las 6 imágenes de tus productos
import pcacer from '../assets/imagenesproductos/computadores/pcescritorio/acer.png';
import i16 from '../assets/imagenesproductos/celulares/celukos/iphone16.png';
import r14 from '../assets/imagenesproductos/celulares/celukos/redmi14.png'; // <- Imagen nueva
import lg from '../assets/imagenesproductos/tv/tvlg65.png';   // <- Imagen nueva
import ai4 from '../assets/imagenesproductos/sonido/airpods4.png'; // <- Imagen nueva
import xbox from '../assets/imagenesproductos/videojuegos/xbox.png'; // <- Imagen nueva

const ProductGrid = () => {
  return (
    <div className="product-grid">
      {/* Producto 1: MacBook Air */}
      <section className="product-card1 light-card">
        <div className="product-content">
          <h2 className="product-title">ACER</h2>
          <p className="product-subtitle">Trabajo duro y rendimiento estable</p>
          <div className="button-container">
            <button className="btn learn-more-btn">Aprende mas</button>
            <button className="btn comprar-btn">Comprar</button>
          </div>
        </div>
        <div className="product-image-container">
          <img src={pcacer} alt="pcacer" className="product-image" />
        </div>
      </section>

      {/* Producto 2: iPad Pro */}
      <section className="product-card1 dark-card">
        <div className="product-content">
          <h2 className="product-title">iphone 16</h2>
          <p className="product-subtitle">Tecnología premium en tu bolsillo.</p>
          <div className="button-container">
            <button className="btn learn-more-btn">Aprende mas</button>
            <button className="btn comprar-btn">comprar</button>
          </div>
        </div>
        <div className="product-image-container">
          <img src={i16} alt="i16" className="product-image" />
        </div>
      </section>

      {/* --- AÑADIMOS 4 PRODUCTOS MÁS --- */}

      {/* Producto 3: iPhone */}
      <section className="product-card1 dark-card">
        <div className="product-content">
          <h2 className="product-title">redmi14</h2>
          <p className="product-subtitle">Buen rendimiento a precio justo</p>
          <div className="button-container">
            <button className="btn learn-more-btn">Aprende mas</button>
            <button className="btn comprar-btn">Comprar</button>
          </div>
        </div>
        <div className="product-image-container">
          <img src={r14} alt="r14" className="product-image" />
        </div>
      </section>

      {/* Producto 4: Apple Watch */}
      <section className="product-card1 light-card">
        <div className="product-content">
          <h2 className="product-title">TV LG 65"</h2>
          <p className="product-subtitle">El cine en tu sala</p>
          <div className="button-container">
            <button className="btn learn-more-btn">Aprende mas</button>
            <button className="btn comprar-btn">Comprar</button>
          </div>
        </div>
        <div className="product-image-container">
          <img src={lg} alt="lg" className="product-image" />
        </div>
      </section>

      {/* Producto 5: AirPods Pro */}
      <section className="product-card1 light-card">
        <div className="product-content">
          <h2 className="product-title">Airpods 4</h2>
          <p className="product-subtitle">Sonido limpio y sin cables, siempre contigo</p>
          <div className="button-container">
            <button className="btn learn-more-btn">Aprende mas</button>
            <button className="btn comprar-btn">Comprar</button>
          </div>
        </div>
        <div className="product-image-container">
          <img src={ai4} alt="ai4" className="product-image" />
        </div>
      </section>

      {/* Producto 6: Mac Studio */}
      <section className="product-card1 dark-card">
        <div className="product-content">
          <h2 className="product-title">Xbox series</h2>
          <p className="product-subtitle">La potencia bruta del gaming</p>
          <div className="button-container">
            <button className="btn learn-more-btn">Aprende mas</button>
            <button className="btn comprar-btn">Comprar</button>
          </div>
        </div>
        <div className="product-image-container">
          <img src={xbox} alt="xbox" className="product-image" />
        </div>
      </section>
    </div>
  );
};

export default ProductGrid;