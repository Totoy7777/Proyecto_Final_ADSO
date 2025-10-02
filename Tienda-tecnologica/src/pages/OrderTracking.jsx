import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyOrders, deleteMyOrder, deleteAllMyOrders } from "../api/orders";
import OrderShipmentTimeline from "../components/OrderShipmentTimeline";
import "../Css/OrderTracking.css";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const OrderTracking = () => {
  const { user, isAuthenticated, authHeader, isAdmin, isSuperAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canView = isAuthenticated && user && !(isAdmin || isSuperAdmin);

  useEffect(() => {
    if (!canView) {
      return;
    }
    let cancelled = false;
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyOrders(user.id, authHeader);
        if (!cancelled) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError?.response?.data ?? fetchError.message ?? "No fue posible cargar tus pedidos");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [authHeader, canView, user?.id]);

  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  const handleDeleteOrder = async (orderId) => {
    if (!authHeader || !orderId) return;
    if (!window.confirm(`¿Eliminar el pedido #${orderId}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteMyOrder(orderId, authHeader);
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    } catch (err) {
      alert(
        err?.response?.data?.message ??
          (typeof err?.response?.data === "string" ? err.response.data : null) ??
          err?.message ??
          "No fue posible eliminar el pedido"
      );
    }
  };

  const handleDeleteAll = async () => {
    if (!authHeader || !user?.id || orders.length === 0) return;
    if (!window.confirm("¿Eliminar todos tus pedidos? Esta acción no se puede deshacer.")) return;
    try {
      await deleteAllMyOrders(user.id, authHeader);
      setOrders([]);
    } catch (err) {
      alert(
        err?.response?.data?.message ??
          (typeof err?.response?.data === "string" ? err.response.data : null) ??
          err?.message ??
          "No fue posible eliminar tus pedidos"
      );
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin || isSuperAdmin) {
    return (
      <div className="order-tracking-container">
        <h1>Seguimiento no disponible</h1>
        <p>
          Solo los usuarios clientes pueden consultar el estado de sus pedidos.
          Usa el panel administrativo para gestionar envíos y pagos.
        </p>
        <Link to="/admin/pedidos" className="btn-checkout">
          Ir al panel de pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="order-tracking-container">
      <h1>Mis pedidos</h1>
      {loading && <p>Cargando pedidos...</p>}
      {error && !loading && <p style={{ color: "#b02a37" }}>{String(error)}</p>}

      {!loading && !hasOrders && !error && (
        <div className="summary-tile">
          <p>No tienes compras registradas aún. Explora el catálogo y agrega productos a tu carrito.</p>
          <Link to="/" className="btn-shop">
            Ir a la tienda
          </Link>
        </div>
      )}

      {hasOrders && (
        <div className="order-tracking-list">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button className="btn-checkout" onClick={handleDeleteAll}>Borrar todos</button>
          </div>
          {orders.map((order) => (
            <article key={order.orderId} className="order-card">
              <header>
                <h2>Orden #{order.orderId}</h2>
                <span className={`order-status-badge ${order.status || ""}`}>
                  {order.status || "--"}
                </span>
                <button
                  onClick={() => handleDeleteOrder(order.orderId)}
                  style={{ marginLeft: "auto" }}
                  className="btn-checkout"
                >
                  Borrar
                </button>
              </header>

              <section className="order-summary-grid">
                <div className="summary-tile">
                  <h3>Fecha</h3>
                  <p>{order.orderedAt ? new Date(order.orderedAt).toLocaleString("es-CO") : "Pendiente"}</p>
                </div>
                <div className="summary-tile">
                  <h3>Total</h3>
                  <p>{order.total ? currency.format(order.total) : "--"}</p>
                </div>
                <div className="summary-tile">
                  <h3>Factura</h3>
                  <p>{order.invoiceNumber || "En proceso"}</p>
                </div>
              </section>

              <section>
                <h3>Productos</h3>
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={`${order.orderId}-${item.productId}`}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.name} />
                            )}
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>{currency.format(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="order-summary-grid">
                <div className="summary-tile">
                  <h3>Pago</h3>
                  {order.payment ? (
                    <>
                      <p>
                        <strong>Estado:</strong> {order.payment.status || "--"}
                      </p>
                      <p>
                        <strong>Método:</strong> {order.payment.method || "--"}
                      </p>
                      {order.payment.reference && (
                        <p>
                          <strong>Referencia:</strong> {order.payment.reference}
                        </p>
                      )}
                      {order.payment.details && (
                        <p>
                          <strong>Detalle:</strong>{" "}
                          {String(order.payment.details)
                            .replace(/;+$/g, "")
                            .replace(/;/g, " · ")}
                        </p>
                      )}
                    </>
                  ) : (
                    <p>Pendiente de confirmar.</p>
                  )}
                </div>

                <div className="summary-tile">
                  <h3>Envío</h3>
                  {order.shipment ? (
                    <>
                      <p>
                        <strong>Estado:</strong> {order.shipment.status || "--"}
                      </p>
                      {order.shipment.tracking && (
                        <p>
                          <strong>Guía:</strong> {order.shipment.tracking}
                        </p>
                      )}
                      {order.shipment.notes && (
                        <p>
                          <strong>Notas:</strong> {order.shipment.notes}
                        </p>
                      )}
                    </>
                  ) : (
                    <p>Aún no se ha generado el envío.</p>
                  )}
                </div>
              </section>

              <section>
                <h3>Seguimiento del pedido</h3>
                <OrderShipmentTimeline payment={order.payment} shipment={order.shipment} />
              </section>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
