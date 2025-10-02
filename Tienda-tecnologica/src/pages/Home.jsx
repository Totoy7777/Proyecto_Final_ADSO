import React, { useEffect, useState } from "react";
import CollegePromo from "../components/CollegePromo";
import ProductCarousel from "../components/ProductCarousel";
import ProductList from "../components/ProductList";
import "../Css/ProductList.css";
import { getProducts } from "../api/products";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("No fue posible cargar los productos");
      }
    };

    load();
  }, []);

  return (
    <div>
      <CollegePromo />

      {/* Carrusel dinámico de productos */}
      <ProductCarousel products={products} />

      <h1 className="text-products">Todos los productos</h1>
      {error && <p style={{ color: "#b02a37", textAlign: "center" }}>{error}</p>}
      <ProductList products={products} onProductsChange={setProducts} />
    </div>
  );
};

export default Home;
