import React from "react";
import "../Css/ProductList.css";

const ProductList = ({ products = [] }) => {
  return (
    <div className="product-list">
      {products.length > 0 ? (
        products.map((product, index) => (
          <div key={index} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <button className="buy-button">Ver Detalles</button>
          </div>
        ))
      ) : (
        <p>No hay productos en esta categoría.</p>
      )}
    </div>
  );
};

export default ProductList;
