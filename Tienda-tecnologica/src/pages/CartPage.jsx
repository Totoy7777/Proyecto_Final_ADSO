// src/pages/CartPage.jsx
import React from 'react';
import { useCart } from '../context/CartContext'; // Importamos el hook
import { Link } from 'react-router-dom';
import '../Css/CartPage.css'; // Estilos para la página del carrito

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();

  // Calculamos el total
  const total = cartItems.reduce((acc, item) => acc + (item.price || 999010) * item.quantity, 0);

  return (
    <div className="cart-page-container">
      <h1>Tu Carrito de Compras</h1>
      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <p>Tu carrito está vacío.</p>
          <Link to="/" className="btn-shop">Seguir comprando</Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-list">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>Cantidad: {item.quantity}</p>
                  <p>Precio: ${new Intl.NumberFormat('es-CO').format(item.price || 999010)}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="remove-btn">
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Resumen del pedido</h2>
            <p>Total: <strong>${new Intl.NumberFormat('es-CO').format(total)}</strong></p>
            <button className="btn-checkout">Finalizar Compra</button>
            <button onClick={clearCart} className="btn-clear">Vaciar Carrito</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;