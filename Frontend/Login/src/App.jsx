import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import Registro from "./InterfazUsuario/Registro";
import Login from "./InterfazUsuario/Login";
import "./Css/Registro.css"; // importa tus estilos

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirigir la raíz "/" hacia "/login" */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Rutas para cada página */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Página no encontrada */}
          <Route path="*" element={<h2>Página no encontrada</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
