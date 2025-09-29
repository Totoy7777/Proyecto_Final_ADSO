import React, { useEffect, useState } from "react";
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
      <h1 className="text-products">Todos los productos</h1>
      {error && <p style={{ color: "#b02a37", textAlign: "center" }}>{error}</p>}
      <ProductList products={products} onProductsChange={setProducts} />

      <footer className="footer-container">
        <p>footer</p>
      </footer>
    </div>
  );
};

export default Home;
