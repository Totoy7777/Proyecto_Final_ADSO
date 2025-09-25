import React from "react";
// 1. IMPORTA Link DE REACT-ROUTER-DOM
import { Link } from "react-router-dom";
import "../Css/ProductList.css";

const ProductList = ({ products = [] }) => {
  return (
    <div className="product-list">
      {products.length > 0 ? (
        products.map((product) => ( // Cambié index por el 'id' del producto para el key
          <div key={product.id} className="product-card">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
            )}

            <h3>{product.name}</h3>
            <p>{product.description}</p>
            
            {/* 2. CAMBIA EL BOTÓN POR UN ENLACE (LINK) */}
            <Link to={`/producto/${product.id}`} className="buy-button">
              Ver Detalles
            </Link>
          </div>
        ))
      ) : (
        <p>No hay productos en esta categoría.</p>
      )}
    </div>
  );
};

export default ProductList;