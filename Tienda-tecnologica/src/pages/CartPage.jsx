import React from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import "../Css/CartPage.css";

const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    updateQuantity,
    loading,
    total,
    isAuthenticated,
  } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 0) {
      return;
    }
    updateQuantity(productId, quantity);
  };

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para finalizar la compra");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="cart-page-container">
      <h1>Tu Carrito de Compras</h1>
      {loading && <p>Cargando carrito...</p>}
      {!loading && cartItems.length === 0 ? (
        <div className="cart-empty">
          <p>Tu carrito está vacío.</p>
          <Link to="/" className="btn-shop">
            Seguir comprando
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.productId} className="cart-item">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                  />
                )}
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <div className="cart-quantity-controls">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(item.productId, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(item.productId, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <p>{formatter.format(item.price ?? 0)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="remove-btn"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Resumen del pedido</h2>
            <p>
              Total: <strong>{formatter.format(total)}</strong>
            </p>
            <button className="btn-checkout" onClick={handleCheckoutClick}>
              Finalizar Compra
            </button>
            <button onClick={clearCart} className="btn-clear">
              Vaciar Carrito
            </button>
            {!isAuthenticated && (
              <p className="cart-note">
                Debes iniciar sesión para guardar tu carrito y continuar al pago.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
