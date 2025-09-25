// src/components/Footer.jsx

import React from 'react';
import '../Css/Footer.css'; // Importaremos sus estilos

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        
        {/* Sección de Notas (Texto pequeño de arriba) */}
        <section className="footer-notes">
          <p>
            El valor del intercambio variará según el estado, el año y la configuración del dispositivo elegible. No todos los dispositivos son elegibles para recibir crédito. Debe tener al menos 18 años para poder canjearlo por crédito o una tarjeta de regalo de Xtech.
          </p>
          <p>
            Para acceder y utilizar todas las funciones, debes agregar Registrar tu usuario en Xtech. 
          </p>
        </section>

        {/* Sección Principal de Enlaces en Columnas */}
        <section className="footer-links-container">
          <div className="footer-column">
            <h3>Compra y aprende</h3>
            <ul>
              <li><a href="#">Inicio</a></li>
              <li><a href="#">Computadores</a></li>
              <li><a href="#">Celulares</a></li>
              <li><a href="#">Tv</a></li>
              <li><a href="#">Videojuegos</a></li>
              <li><a href="#">Audio</a></li>
              <li><a href="#">Mas</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Cuenta</h3>
            <ul>
              <li><a href="#">Administra tu usuario</a></li>
              <li><a href="#">Privacidad</a></li>
              <li><a href="#">Atencion al cliente</a></li>
            </ul>
            <h3>Entretenimiento</h3>
            <ul>
              <li><a href="#">Xbox</a></li>
              <li><a href="#">Ps5</a></li>
              <li><a href="#">Nintendo</a></li>
              <li><a href="#">Titulos</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Xtech</h3>
            <ul>
              <li><a href="#">Find a Store</a></li>
              <li><a href="#">Devolicones</a></li>
              <li><a href="#">Hoy en Xtech</a></li>
              <li><a href="#">Torneos Xtech</a></li>
              <li><a href="#">Ayuda para comprar</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Para empresas</h3>
            <ul>
              <li><a href="#">Xtech para empresas</a></li>
              <li><a href="#">Compras para empresas</a></li>
            </ul>
            <h3>Para la educacion</h3>
            <ul>
              <li><a href="#">Xtech y educacion</a></li>
              <li><a href="#">Compras al por mayor</a></li>
              <li><a href="#">Compras para la universidad</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Valores de Xtech</h3>
            <ul>
              <li><a href="#">Accesibilidad</a></li>
              <li><a href="#">Educación</a></li>
              <li><a href="#">Ambiente</a></li>
              <li><a href="#">Privacidad</a></li>
              <li><a href="#">Responsabilidad del proveedor</a></li>
            </ul>
          </div>
        </section>

        {/* Línea de "Más formas de comprar" */}
        <section className="footer-more-ways">
          <p>Mas formas de comprar: <a href="#">Busca una tienda Xtech</a> u <a href="#">otro minorista</a> cerca de ti. o llama 302 XXX XXXX.</p>
        </section>

        {/* Barra Inferior (Copyright, Políticas, etc.) */}
        <section className="footer-bottom-bar">
          <div className="footer-copyright">
            <p>Copyright © 2025 Xtech Inc. Todos los derechos reservados.</p>
          </div>
          <div className="footer-policy-links">
            <ul>
              <li><a href="#">política de privacidad</a></li>
              <li><a href="#">Condiciones de uso</a></li>
              <li><a href="#">Ventas y reembolsos</a></li>
              <li><a href="#">Legal</a></li>
              <li><a href="#">Mapa del sitio</a></li>
            </ul>
          </div>
          <div className="footer-region">
            <a href="#">Colombia</a>
          </div>
        </section>
        
      </div>
    </footer>
  );
};

export default Footer;