import React from "react";
import ProductList from "../components/ProductList";
import productsData from "../data/products";
import "../Css/ProductList.css"


const Home = () => {
  // Convertimos el objeto en un array de productos
  const allProducts = Object.values(productsData) // [ {portatiles:[], escritorio:[], ...}, {smartphones:[], ...}, ... ]
    .flatMap(category =>
      Object.values(category).flat() // Unimos todas las subcategorías
    );

  return (
    <div>
      <h1 className="text-products">Todos los productos</h1>
      <ProductList products={allProducts} />

      <footer className="footer-container">
                <p>footer</p>
            </footer> 
    </div>
  );
};

export default Home;
