import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getOrders,
  getOrderById,
  updatePaymentStatus,
  updateShipmentStatus,
  updateOrderStatus,
  addShipmentEvent,
} from "../api/orders";
import { useAuth } from "../context/AuthContext";
import "../Css/AdminOrders.css";

const paymentStatuses = ["PENDIENTE", "APROBADO", "FALLIDO"];
const shipmentStatuses = ["LISTO", "ENVIADO", "ENTREGADO", "DEVUELTO"];
const orderStatuses = ["NUEVO", "PAGADO", "ENVIADO", "CANCELADO"];

const AdminOrders = () => {
  const { isAuthenticated, isAdmin, isSuperAdmin, authHeader } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const canManage = isAdmin || isSuperAdmin;
  const [newEvent, setNewEvent] = useState({ status: "LISTO", message: "" });

  const loadOrders = useCallback(async () => {
    if (!canManage || !authHeader) {
      return;
    }
    try {
      setLoading(true);
      const data = await getOrders(authHeader);
      const list = Array.isArray(data) ? data : [];
      // Ocultar pedidos ya entregados o cancelados del listado principal
      const visible = list.filter(
        (o) => (o?.shipment?.estadoEnvio ?? "") !== "ENTREGADO" && (o?.estado ?? "") !== "CANCELADO"
      );
      setOrders(visible);
      if (selectedOrderId) {
        const detail = list.find((order) => order.orderId === selectedOrderId);
        if (detail) {
          setSelectedOrder(detail);
        }
      }
    } catch (err) {
      console.error("[AdminOrders] loadOrders", err);
      setError("No fue posible cargar las órdenes");
    } finally {
      setLoading(false);
    }
  }, [authHeader, canManage, selectedOrderId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSelectOrder = async (orderId) => {
    setSelectedOrderId(orderId);
    if (!authHeader) {
      return;
    }
    try {
      const data = await getOrderById(orderId, authHeader);
      setSelectedOrder(data);
    } catch (err) {
      console.error("[AdminOrders] handleSelectOrder", err);
      setError("No fue posible cargar la orden seleccionada");
    }
  };

  const refreshSelected = async (orderId) => {
    if (!orderId || !authHeader) {
      return;
    }
    const data = await getOrderById(orderId, authHeader);
    setSelectedOrder(data);
    await loadOrders();
  };

  const handleAddEvent = async () => {
    if (!selectedOrder || !authHeader) return;
    try {
      setLoading(true);
      await addShipmentEvent(
        selectedOrder.orderId,
        { estado: newEvent.status, mensaje: newEvent.message },
        authHeader
      );
      setNewEvent({ status: newEvent.status, message: "" });
      await refreshSelected(selectedOrder.orderId);
    } catch (err) {
      console.error("[AdminOrders] handleAddEvent", err);
      const msg =
        err?.response?.data?.message ??
        (typeof err?.response?.data === "string" ? err.response.data : null) ??
        err?.message ??
        "No fue posible agregar el evento de envío";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishDelivery = async () => {
    if (!selectedOrder || !authHeader) return;
    try {
      setLoading(true);
      await updateShipmentStatus(
        selectedOrder.orderId,
        { estado: "ENTREGADO" },
        authHeader
      );
      setSelectedOrderId(null);
      setSelectedOrder(null);
      await loadOrders();
    } catch (err) {
      console.error("[AdminOrders] handleFinishDelivery", err);
      setError("No fue posible finalizar el seguimiento (marcar como ENTREGADO)");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !authHeader) return;
    if (!window.confirm("¿Cancelar este pedido? Se repondrá el stock si corresponde.")) {
      return;
    }
    try {
      setLoading(true);
      await updateOrderStatus(
        selectedOrder.orderId,
        { estado: "CANCELADO" },
        authHeader
      );
      setSelectedOrderId(null);
      setSelectedOrder(null);
      await loadOrders();
    } catch (err) {
      console.error("[AdminOrders] handleCancelOrder", err);
      const msg =
        err?.response?.data?.message ??
        (typeof err?.response?.data === "string" ? err.response.data : null) ??
        err?.message ??
        "No fue posible cancelar el pedido";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async (estado) => {
    if (!selectedOrder) return;
    try {
      await updatePaymentStatus(
        selectedOrder.orderId,
        { estado },
        authHeader
      );
      await refreshSelected(selectedOrder.orderId);
    } catch (err) {
      console.error("[AdminOrders] handlePaymentUpdate", err);
      setError("No fue posible actualizar el estado del pago");
    }
  };

  const handleShipmentUpdate = async (payload) => {
    if (!selectedOrder) return;
    try {
      await updateShipmentStatus(selectedOrder.orderId, payload, authHeader);
      await refreshSelected(selectedOrder.orderId);
    } catch (err) {
      console.error("[AdminOrders] handleShipmentUpdate", err);
      const msg =
        err?.response?.data?.message ??
        (typeof err?.response?.data === "string" ? err.response.data : null) ??
        err?.message ??
        "No fue posible actualizar el envío";
      setError(msg);
    }
  };

  const handleOrderStatusUpdate = async (estado) => {
    if (!selectedOrder) return;
    try {
      await updateOrderStatus(selectedOrder.orderId, { estado }, authHeader);
      await refreshSelected(selectedOrder.orderId);
    } catch (err) {
      console.error("[AdminOrders] handleOrderStatusUpdate", err);
      setError("No fue posible actualizar la orden");
    }
  };

  const selectedPaymentStatus = selectedOrder?.payment?.estadoPago;
  const selectedShipmentStatus = selectedOrder?.shipment?.estadoEnvio;
  const selectedOrderStatus = selectedOrder?.estado;

  if (!isAuthenticated || !canManage) {
    return (
      <div className="admin-orders">
        <h1>Gestión de pedidos</h1>
        <p>No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      <h1>Gestión de pedidos</h1>
      {error && <p className="admin-orders-error">{error}</p>}
      <div className="admin-orders-content">
        <section className="admin-orders-list">
          <header>
            <h2>Pedidos recientes</h2>
            <button onClick={loadOrders} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </header>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Orden</th>
                <th>Pago</th>
                <th>Envío</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(orders) ? orders : []).map((order) => {
                const ship = order.shipment || {};
                const dotClass =
                  ship.estadoEnvio === "ENTREGADO"
                    ? "dot-green"
                    : ship.estadoEnvio === "ENVIADO"
                    ? "dot-blue"
                    : ship.estadoEnvio === "DEVUELTO"
                    ? "dot-red"
                    : "dot-yellow";
                return (
                <tr key={order.orderId}>
                  <td>{order.orderId}</td>
                  <td>{order.user?.nombre}</td>
                  <td>{new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0,
                  }).format(order.total ?? 0)}</td>
                  <td>{order.estado}</td>
                  <td>{order.payment?.estadoPago ?? "—"}</td>
                  <td>
                    <span className="status-badge">
                      <span className={`status-dot ${dotClass}`} />
                      {ship.estadoEnvio ?? "—"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleSelectOrder(order.orderId)}>
                      Ver
                    </button>
                  </td>
                </tr>
              );})}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7}>No hay pedidos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {selectedOrder && (
          <section className="admin-orders-detail">
            <h2>Pedido #{selectedOrder.orderId}</h2>
            <p>
              Cliente: <strong>{selectedOrder.user?.nombre}</strong>
            </p>
            <p>
              Correo: <strong>{selectedOrder.user?.email}</strong>
            </p>
            <p>
              Total: <strong>{new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              }).format(selectedOrder.total ?? 0)}</strong>
            </p>

            <h3>Productos</h3>
            <ul>
              {(selectedOrder.items ?? []).map((item) => (
                <li key={`${selectedOrder.orderId}-${item.id?.productId}`}>
                  {item.product?.name} x {item.cantidad} - $
                  {item.precioUnitario}
                </li>
              ))}
            </ul>

            <div className="admin-orders-panel">
              <h3>Pago</h3>
              <p>Estado actual: {selectedPaymentStatus ?? "—"}</p>
              <select
                value={selectedPaymentStatus ?? "PENDIENTE"}
                onChange={(e) => handlePaymentUpdate(e.target.value)}
              >
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-orders-panel">
              <h3>Envío</h3>
              <p>Estado actual: {selectedShipmentStatus ?? "—"}</p>
              <select
                value={selectedShipmentStatus ?? "LISTO"}
                onChange={(e) =>
                  handleShipmentUpdate({ estado: e.target.value })
                }
              >
                {shipmentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <label>
                Tracking
                <input
                  type="text"
                  defaultValue={selectedOrder.shipment?.tracking ?? ""}
                  onBlur={(event) =>
                    handleShipmentUpdate({
                      estado: selectedShipmentStatus,
                      tracking: event.target.value,
                    })
                  }
                />
              </label>
              {selectedShipmentStatus !== "ENTREGADO" && (
                <div style={{ marginTop: 8 }}>
                  <button onClick={handleFinishDelivery} disabled={loading}>
                    {loading ? "Guardando..." : "Finalizar seguimiento (ENTREGADO)"}
                  </button>
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <h4>Línea de tiempo</h4>
                {Array.isArray(selectedOrder.shipment?.eventos) &&
                  selectedOrder.shipment.eventos.length > 0 ? (
                  <ul>
                    {selectedOrder.shipment.eventos.map((ev) => (
                      <li key={ev.eventId}>
                        <strong>{ev.estado}</strong> - {ev.mensaje || "Actualización"} ({ev.registradoEn ? new Date(ev.registradoEn).toLocaleString("es-CO") : ""})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay eventos de seguimiento.</p>
                )}

                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                  <select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent((s) => ({ ...s, status: e.target.value }))}
                  >
                    {shipmentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Mensaje (opcional)"
                    value={newEvent.message}
                    onChange={(e) => setNewEvent((s) => ({ ...s, message: e.target.value }))}
                    style={{ flex: 1 }}
                  />
                  <button onClick={handleAddEvent} disabled={loading}>
                    {loading ? "Guardando..." : "Agregar evento"}
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-orders-panel">
              <h3>Estado de la orden</h3>
              <select
                value={selectedOrderStatus ?? "NUEVO"}
                onChange={(e) => handleOrderStatusUpdate(e.target.value)}
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {selectedOrderStatus !== "CANCELADO" && (
                <div style={{ marginTop: 8 }}>
                  <button onClick={handleCancelOrder} disabled={loading}>
                    {loading ? "Guardando..." : "Cancelar pedido"}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
