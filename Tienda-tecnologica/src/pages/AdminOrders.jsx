import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getOrders,
  getOrderById,
  updatePaymentStatus,
  updateShipmentStatus,
  updateOrderStatus,
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

  const loadOrders = useCallback(async () => {
    if (!canManage || !authHeader) {
      return;
    }
    try {
      setLoading(true);
      const data = await getOrders(authHeader);
      setOrders(data ?? []);
      if (selectedOrderId) {
        const detail = data.find((order) => order.orderId === selectedOrderId);
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
      setError("No fue posible actualizar el envío");
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
              {orders.map((order) => (
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
                  <td>{order.shipment?.estadoEnvio ?? "—"}</td>
                  <td>
                    <button onClick={() => handleSelectOrder(order.orderId)}>
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
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
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
