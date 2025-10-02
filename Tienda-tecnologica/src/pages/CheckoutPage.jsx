import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../Css/CartPage.css";

const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const paymentOptions = [
  { id: "PSE_NEQUI", label: "PSE / Nequi" },
  { id: "TARJETA_CREDITO", label: "Tarjeta de crédito" },
  { id: "TARJETA_DEBITO", label: "Tarjeta débito" },
];

const CheckoutPage = () => {
  const { cartItems, total, checkout, loading, isAuthenticated } = useCart();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    shippingName: user?.nombre ?? "",
    shippingAddress: "",
    shippingCity: "",
    shippingPhone: "",
    notes: "",
    paymentMethod: "PSE_NEQUI",
    pseEntity: "",
    walletPhone: "",
    cardHolder: "",
    cardNumber: "",
    cardExpiration: "",
    cardCvv: "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!user?.nombre) {
      return;
    }
    setForm((prev) =>
      prev.shippingName ? prev : { ...prev, shippingName: user.nombre }
    );
  }, [user?.nombre]);

  const steps = useMemo(() => {
    if (result) {
      return [
        { label: "Carrito", status: "done" },
        { label: "Datos de envío", status: "done" },
        { label: "Pago", status: "done" },
        { label: "Confirmación", status: "active" },
      ];
    }
    return [
      { label: "Carrito", status: "done" },
      { label: "Datos de envío", status: "active" },
      { label: "Pago", status: "active" },
      { label: "Confirmación", status: "pending" },
    ];
  }, [result]);

  if (isAdmin || isSuperAdmin) {
    return (
      <div className="cart-page-container">
        <h1>Finalizar compra</h1>
        <p>
          El flujo de compra está disponible únicamente para usuarios clientes.
          Como administrador puedes gestionar los pedidos desde el panel.
        </p>
        <Link to="/admin/pedidos" className="btn-checkout">
          Ir a gestión de pedidos
        </Link>
      </div>
    );
  }

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const canSubmit = useMemo(() => {
    if (!isAuthenticated) {
      return false;
    }
    if (!form.shippingName || !form.shippingAddress) {
      return false;
    }
    if (form.paymentMethod === "PSE_NEQUI") {
      return Boolean(form.walletPhone || form.pseEntity);
    }
    if (
      form.paymentMethod === "TARJETA_CREDITO" ||
      form.paymentMethod === "TARJETA_DEBITO"
    ) {
      return (
        Boolean(form.cardHolder) &&
        Boolean(form.cardNumber) &&
        Boolean(form.cardExpiration)
      );
    }
    return true;
  }, [form, isAuthenticated]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const response = await checkout({
        shippingName: form.shippingName,
        shippingAddress: form.shippingAddress,
        shippingCity: form.shippingCity,
        shippingPhone: form.shippingPhone,
        notes: form.notes,
        payment: {
          method: form.paymentMethod,
          pseEntity: form.pseEntity,
          walletPhone: form.walletPhone,
          cardHolder: form.cardHolder,
          cardNumber: form.cardNumber,
          cardExpiration: form.cardExpiration,
          cardCvv: form.cardCvv,
        },
      });
      setResult(response);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message ?? "No fue posible completar el pago");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="cart-page-container">
        <h1>Finalizar compra</h1>
        <div className="checkout-steps">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={`checkout-step ${step.status}`}
            >
              <span className="checkout-step__number">{index + 1}</span>
              <span className="checkout-step__label">{step.label}</span>
            </div>
          ))}
        </div>
        <p>Debes iniciar sesión para finalizar tu compra.</p>
        <Link to="/login" className="btn-shop">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0 && !result) {
    return (
      <div className="cart-page-container">
        <h1>Finalizar compra</h1>
        <div className="checkout-steps">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={`checkout-step ${step.status}`}
            >
              <span className="checkout-step__number">{index + 1}</span>
              <span className="checkout-step__label">{step.label}</span>
            </div>
          ))}
        </div>
        <p>No tienes productos en el carrito.</p>
        <Link to="/" className="btn-shop">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="cart-page-container">
        <h1>¡Gracias por tu compra!</h1>
        <div className="checkout-steps">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={`checkout-step ${step.status}`}
            >
              <span className="checkout-step__number">{index + 1}</span>
              <span className="checkout-step__label">{step.label}</span>
            </div>
          ))}
        </div>
        <div className="order-confirmation">
          <p>
            Número de orden: <strong>{result.orderId}</strong>
          </p>
          <p>
            Referencia de pago: <strong>{result.paymentReference}</strong>
          </p>
          <p>
            Total pagado: <strong>{formatter.format(result.total)}</strong>
          </p>
          <p>
            Estado del envío: <strong>{result.shipmentStatus}</strong>
          </p>
        </div>
        <div className="cart-actions">
          <button className="btn-shop" onClick={() => navigate("/")}>
            Seguir comprando
          </button>
          <Link to="/pedidos" className="btn-checkout">
            Ver mis pedidos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <h1>Finalizar compra</h1>
      <div className="checkout-steps">
        {steps.map((step, index) => (
          <div key={step.label} className={`checkout-step ${step.status}`}>
            <span className="checkout-step__number">{index + 1}</span>
            <span className="checkout-step__label">{step.label}</span>
          </div>
        ))}
      </div>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Datos de envío</legend>
            <label>
              Nombre completo
              <input
                type="text"
                value={form.shippingName}
                onChange={handleChange("shippingName")}
                required
              />
            </label>
            <label>
              Dirección
              <input
                type="text"
                value={form.shippingAddress}
                onChange={handleChange("shippingAddress")}
                required
              />
            </label>
            <label>
              Ciudad
              <input
                type="text"
                value={form.shippingCity}
                onChange={handleChange("shippingCity")}
              />
            </label>
            <label>
              Teléfono de contacto
              <input
                type="tel"
                value={form.shippingPhone}
                onChange={handleChange("shippingPhone")}
              />
            </label>
            <label>
              Notas
              <textarea
                value={form.notes}
                onChange={handleChange("notes")}
                rows={2}
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Método de pago</legend>
            <div className="payment-options">
              {paymentOptions.map((option) => (
                <label key={option.id} className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.id}
                    checked={form.paymentMethod === option.id}
                    onChange={handleChange("paymentMethod")}
                  />
                  {option.label}
                </label>
              ))}
            </div>

            {form.paymentMethod === "PSE_NEQUI" && (
              <div className="payment-extra">
                <label>
                  Entidad PSE (opcional)
                  <input
                    type="text"
                    value={form.pseEntity}
                    onChange={handleChange("pseEntity")}
                  />
                </label>
                <label>
                  Teléfono de Nequi (opcional)
                  <input
                    type="tel"
                    value={form.walletPhone}
                    onChange={handleChange("walletPhone")}
                  />
                </label>
              </div>
            )}

            {(form.paymentMethod === "TARJETA_CREDITO" ||
              form.paymentMethod === "TARJETA_DEBITO") && (
              <div className="payment-extra">
                <label>
                  Titular de la tarjeta
                  <input
                    type="text"
                    value={form.cardHolder}
                    onChange={handleChange("cardHolder")}
                  />
                </label>
                <label>
                  Número de la tarjeta
                  <input
                    type="text"
                    value={form.cardNumber}
                    onChange={handleChange("cardNumber")}
                  />
                </label>
                <div className="payment-inline">
                  <label>
                    Vencimiento (MM/AA)
                    <input
                      type="text"
                      value={form.cardExpiration}
                      onChange={handleChange("cardExpiration")}
                    />
                  </label>
                  <label>
                    CVV
                    <input
                      type="password"
                      value={form.cardCvv}
                      onChange={handleChange("cardCvv")}
                    />
                  </label>
                </div>
              </div>
            )}
          </fieldset>

          {error && <p className="cart-error">{error}</p>}

          <button
            type="submit"
            className="btn-checkout"
            disabled={submitting || !canSubmit}
          >
            {submitting ? "Procesando..." : "Pagar"}
          </button>
          <Link to="/carrito" className="btn-shop" style={{ marginLeft: 8 }}>
            Regresar al carrito
          </Link>
        </form>

        <aside className="checkout-summary">
          <h2>Resumen</h2>
          <ul>
            {cartItems.map((item) => (
              <li key={item.productId}>
                {item.name} x {item.quantity}
                <span>{formatter.format(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="checkout-total">
            Total: <strong>{formatter.format(total)}</strong>
          </p>
          <div className="checkout-shipping-review">
            <h3>Datos de envío</h3>
            <p>
              <strong>Nombre:</strong> {form.shippingName || "Pendiente"}
            </p>
            <p>
              <strong>Dirección:</strong> {form.shippingAddress || "Pendiente"}
            </p>
            <p>
              <strong>Ciudad:</strong> {form.shippingCity || "Pendiente"}
            </p>
            <p>
              <strong>Contacto:</strong> {form.shippingPhone || "Pendiente"}
            </p>
            <p className="checkout-shipping-hint">
              Esta información se utiliza para el envío y el envío del soporte a tu
              correo.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
