// src/components/ProductCarousel.jsx
import React, { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import '../Css/ProductCarousel.css';

const normalizeProduct = (p) => {
  if (!p) return null;
  return {
    id: p.productId ?? p.id,
    name: p.name ?? '',
    description: p.description ?? '',
    image: p.imageUrl ?? p.image ?? '',
    price: p.price ?? p.precio ?? 0,
  };
};

const ProductCarousel = ({ products = [] }) => {
  const items = useMemo(
    () => (Array.isArray(products) ? products : []).map(normalizeProduct).filter(Boolean),
    [products]
  );

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="product-carousel-container">
      <h2 className="product-carousel-title">Explora nuestros productos</h2>
      <Swiper
        modules={[Pagination]}
        spaceBetween={16}
        pagination={{ clickable: true }}
        breakpoints={{
          480: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          900: { slidesPerView: 3 },
          1200: { slidesPerView: 4 },
        }}
        className="productSwiper"
      >
        {items.map((p) => (
          <SwiperSlide key={p.id}>
            <div className="product-slide-card">
              {p.image && (
                <img src={p.image} alt={p.name} className="product-slide-image" />
              )}
              <div className="product-slide-body">
                <h3 className="product-slide-name">{p.name}</h3>
                {p.description && (
                  <p className="product-slide-desc">{p.description}</p>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductCarousel;

