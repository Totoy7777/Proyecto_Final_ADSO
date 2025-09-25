import React from 'react';
import { useParams } from 'react-router-dom';
import allProducts from '../data/products.js'; // Asegúrate que la ruta sea correcta

// Se importa el hook para usar el contexto del carrito
import { useCart } from '../context/CartContext';

// Importamos los íconos
import { FaStar, FaStarHalfAlt, FaTruck, FaStore, FaHeart, FaBalanceScale } from 'react-icons/fa';
import '../Css/ProductDetail.css';

// Función para buscar un producto por su ID (esta no cambia)
const findProductById = (id) => {
  for (const category in allProducts) {
    for (const subcategory in allProducts[category]) {
      const product = allProducts[category][subcategory].find(p => p.id === id);
      if (product) {
        return product;
      }
    }
  }
  return null;
};

const ProductDetail = () => {
  const { productId } = useParams();
  const product = findProductById(productId);

  // 1. OBTENEMOS LA FUNCIÓN addToCart DESDE NUESTRO CONTEXTO
  const { addToCart } = useCart();

  // 2. CREAMOS UNA FUNCIÓN PARA MANEJAR EL CLIC DEL BOTÓN
  const handleAddToCart = () => {
    if (product) {
      addToCart(product); // Llamamos a la función del contexto
      alert(`"${product.name}" fue agregado al carrito.`); // Mensaje de confirmación
    }
  };

  if (!product) {
    return <div className="product-detail-container"><p>Producto no encontrado.</p></div>;
  }

  const finalPrice = 999010;

  return (
    <div className="product-detail-container">
      <div className="top-section">
        <div className="image-gallery-single">
          <div className="main-image-single">
            <img src={product.image} alt={product.name} />
          </div>
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          
          <div className="rating">
            <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStarHalfAlt />
            <span>(37 Opiniones)</span>
          </div>

          <div className="price-section">
            <p className="final-price">${new Intl.NumberFormat('es-CO').format(finalPrice)}</p>
            <p className="installments">Hasta 48 cuotas</p>
          </div>

          <div className="shipping-options">
            <div className="option"><FaTruck className="icon" /><span>Envío <strong>GRATIS</strong></span></div>
            <div className="option"><FaStore className="icon" /><span>Recoge en tienda</span></div>
          </div>

          <div className="actions">
            {/* 3. CONECTAMOS LA FUNCIÓN AL BOTÓN CON onClick */}
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Agregar al carrito
            </button>
          </div>

          <div className="extra-actions">
            <a href="#"><FaHeart /> Favorito</a>
            <a href="#"><FaBalanceScale /> Comparar</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;