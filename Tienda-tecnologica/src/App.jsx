import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu";
import Home from "./pages/Home";
import Categoria from "./pages/Categoria";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import "./Css/menu.css";
import "./Css/Submenu.css";

// Componentes
import CollegePromo from './components/CollegePromo';
import ProductGrid from './components/ProductGrid';
import CardSlider from './components/CardSlider';
import Footer from "./components/Footer.jsx";

import { CartProvider } from "./context/CartContext";
import CartPage from "./pages/CartPage"; 
import ProductDetail from './components/ProductDetail';

function App() {
  return (
    <CartProvider>
    <Router>
      <div className="app">
        <Menu />
        <Routes>
          {/* Página principal */}
          <Route
            path="/"
            element={
              <>
                <CollegePromo />
                <ProductGrid />
                <CardSlider />
              </>
            }
          />

          {/* Otras páginas */}
          <Route path="/categoria/:categoria" element={<Categoria />} />
          <Route path="/categoria/:categoria/:subcategoria" element={<Categoria />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/producto/:productId" element={<ProductDetail />} />
              {/* 3. AGREGA LA RUTA PARA LA PÁGINA DEL CARRITO */}
            <Route path="/carrito" element={<CartPage />} />

        </Routes>
        <Footer></Footer>
      </div>
    </Router>
    </CartProvider>
  );
}

export default App;
