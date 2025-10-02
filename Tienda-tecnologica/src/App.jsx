import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu";
import Home from "./pages/Home";
import Categoria from "./pages/Categoria";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Recuperar from "./pages/Recuperar";
import "./Css/Menu.css";
import "./Css/Submenu.css";

// Componentes
import Footer from "./components/Footer.jsx";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import CartPage from "./pages/CartPage"; 
import CheckoutPage from "./pages/CheckoutPage";
import ProductDetail from './components/ProductDetail';
import Profile from "./pages/Profile";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import OrderTracking from "./pages/OrderTracking";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app">
            <Menu />
            <Routes>
          {/* Página principal */}
              <Route path="/" element={<Home />} />

          {/* Otras páginas */}
              <Route path="/categoria/:categoria" element={<Categoria />} />
              <Route path="/categoria/:categoria/:subcategoria" element={<Categoria />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/recuperar" element={<Recuperar />} />
              <Route path="/producto/:productId" element={<ProductDetail />} />
              {/* 3. AGREGA LA RUTA PARA LA PÁGINA DEL CARRITO */}
              <Route path="/carrito" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/pedidos" element={<OrderTracking />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/admin/productos" element={<AdminProducts />} />
              <Route path="/admin/pedidos" element={<AdminOrders />} />

            </Routes>
            <Footer></Footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
