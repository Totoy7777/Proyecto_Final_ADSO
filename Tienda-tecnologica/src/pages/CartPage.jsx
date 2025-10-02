import React from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
    error,
  } = useCart();
  const { isAdmin, isSuperAdmin } = useAuth();
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

  if (isAdmin || isSuperAdmin) {
    return (
      <div className="cart-page-container">
        <h1>Carrito no disponible</h1>
        <p>
          Los administradores gestionan los pedidos directamente desde el panel. El
          carrito solo está habilitado para clientes.
        </p>
        <Link to="/admin/productos" className="btn-shop">
          Ir al panel de administración
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <h1>Tu Carrito de Compras</h1>
      {loading && <p>Cargando carrito...</p>}
      {error && <p className="cart-error">{error}</p>}
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
                    {(() => {
                      const raw = Number(item?.product?.stock ?? Infinity);
                      const max = Number.isFinite(raw) && raw >= 0 ? (raw || 1) : Math.max(item.quantity, 1);
                      const options = Array.from({ length: Math.min(max, 50) }, (_, i) => i + 1);
                      return (
                        <label>
                          Cantidad
                          <select
                            value={item.quantity}
                            onChange={(e) => {
                              const q = Number(e.target.value);
                              handleQuantityChange(item.productId, q);
                            }}
                            style={{ marginLeft: 8 }}
                          >
                            {options.map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                            {/* Permitir quitar */}
                            <option value={0}>0 (Quitar)</option>
                          </select>
                        </label>
                      );
                    })()}
                  </div>
                  <p>
                    <span>Precio unidad:</span> {formatter.format(item.price ?? 0)}
                  </p>
                  <p>
                    <span>Subtotal:</span>{" "}
                    {formatter.format((item.price ?? 0) * (item.quantity ?? 0))}
                  </p>
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
                Conservamos tus productos en este navegador hasta que finalices la
                compra. Inicia sesión para sincronizarlos con tu cuenta y poder
                pagar.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
