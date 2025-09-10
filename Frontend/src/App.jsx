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

function App() {
  return (
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
