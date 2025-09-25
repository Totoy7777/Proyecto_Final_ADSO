// src/components/CardSlider.jsx

import React from 'react';

// 1. Importaciones de Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

// 2. Importamos los estilos de Swiper
import 'swiper/css';
import 'swiper/css/pagination';

// 3. Importamos nuestros propios estilos para las tarjetas
import '../Css/CardSlider.css';

// 4. Importa las imágenes que usarás en las tarjetas del slider
import slideImg1 from '../assets/imagenesproductos/videojuegos/fc26.jpg';
import slideImg2 from '../assets/imagenesproductos/videojuegos/nba26.jpg';
import slideImg3 from '../assets/imagenesproductos/videojuegos/until.jpg';
import slideImg4 from '../assets/imagenesproductos/videojuegos/spiderman.jpg';
import slideImg5 from '../assets/imagenesproductos/videojuegos/mario.jpg'; // Imagen de ejemplo
import slideImg6 from '../assets/imagenesproductos/videojuegos/f1.jpg';   // Imagen de ejemplo

const CardSlider = () => {
  return (
    <div className="slider-container">
      <h2 className="slider-title">Ultimos lanzamientos</h2>
      
      <Swiper
        // Le decimos a Swiper que use el módulo de Paginación (los puntitos)
        modules={[Pagination]}
        
        // Espacio entre cada "slide" o tarjeta
        spaceBetween={15}
        
        // Hacemos que la paginación sea clickeable
        pagination={{ clickable: true }}
        
        // Esto es para hacerlo responsivo:
        // Define cuántas tarjetas se ven según el tamaño de la pantalla
        breakpoints={{
          // Cuando la ventana es >= 640px, muestra 2 tarjetas
          640: {
            slidesPerView: 2,
          },
          // Cuando la ventana es >= 768px, muestra 3 tarjetas
          768: {
            slidesPerView: 3,
          },
          // Cuando la ventana es >= 1024px, muestra 4 tarjetas
          1024: {
            slidesPerView: 4,
          },
        }}
        className="mySwiper"
      >
        {/* Aquí va cada una de las tarjetas (slides) */}
        <SwiperSlide>
          <div className="slide-card" style={{ backgroundImage: `url(${slideImg1})` }}>
            <div className="slide-content">
             
             
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="slide-card" style={{ backgroundImage: `url(${slideImg2})` }}>
            <div className="slide-content">
         
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="slide-card" style={{ backgroundImage: `url(${slideImg3})` }}>
            <div className="slide-content">
            
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="slide-card" style={{ backgroundImage: `url(${slideImg4})` }}>
            <div className="slide-content">
              
            </div>
          </div>
        </SwiperSlide>
        
        <SwiperSlide>
          <div className="slide-card" style={{ backgroundImage: `url(${slideImg5})` }}>
            <div className="slide-content">
              
            </div>
          </div>
        </SwiperSlide>
        
        <SwiperSlide>
          <div className="slide-card" style={{ backgroundImage: `url(${slideImg6})` }}>
            <div className="slide-content">
             
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default CardSlider;