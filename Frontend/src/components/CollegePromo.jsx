// src/components/CollegePromo.jsx

import React from 'react';
import '../Css/CollegePromo.css'; // Sus propios estilos

// Importa la imagen de fondo para el banner
import promoBackground from '../assets/imagenesproductos/videojuegos/ps5pre.png';

const CollegePromo = () => {
  return (
    <section
      className="college-promo-section"
      style={{ backgroundImage: `url(${promoBackground})` }}
    >
      <div className="promo-content">

        <span className="education-savings">Aprende mas</span>
        <button className="shop-btn">Comprar</button>
      </div>
    </section>
  );
};

export default CollegePromo;