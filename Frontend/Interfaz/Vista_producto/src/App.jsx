import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import "./Css/ProducList.css";
import ProducList from "./InterfazUsuario/ProducList";
import Computadores from "./InterfazUsuario/Computadores";
import Celulares from "./InterfazUsuario/Celulares";
import Tv from "./InterfazUsuario/Tv";
import Audio from "./InterfazUsuario/Audio";
import Videojuegos from "./InterfazUsuario/Videojuegos";

const App = () => {
  return (
          <BrowserRouter>
            <Routes>
                {/* La ruta principal "/" mostrará el componente ProductList */}
                <Route path="/" element={<ProducList />} />
                {/* Las demás rutas mostrarán su respectivo componente */}
                <Route path="/computadores" element={<Computadores />} />
                {/* Agrega las demás rutas aquí, una por cada página */}
                 <Route path="/celulares" element={<Celulares />} /> 
                 <Route path="/tv" element={<Tv />} /> 
                 <Route path="/videojuegos" element={<Videojuegos />} /> 
                 <Route path="/audio" element={<Audio />} /> 
            </Routes>
          </BrowserRouter>
       
    
  );
}

export default App;
