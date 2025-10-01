import api from "./axios";

const authConfig = (authHeader) =>
  authHeader
    ? {
        headers: {
          Authorization: authHeader,
        },
      }
    : {};

export const getOrders = (authHeader) =>
  api.get("/admin/orders", authConfig(authHeader)).then((res) => res.data);

export const getOrderById = (orderId, authHeader) =>
  api
    .get(`/admin/orders/${orderId}`, authConfig(authHeader))
    .then((res) => res.data);

export const updatePaymentStatus = (orderId, payload, authHeader) =>
  api
    .patch(`/admin/orders/${orderId}/payment`, payload, authConfig(authHeader))
    .then((res) => res.data);

export const updateShipmentStatus = (orderId, payload, authHeader) =>
  api
    .patch(`/admin/orders/${orderId}/shipment`, payload, authConfig(authHeader))
    .then((res) => res.data);

export const updateOrderStatus = (orderId, payload, authHeader) =>
  api
    .patch(`/admin/orders/${orderId}/status`, payload, authConfig(authHeader))
    .then((res) => res.data);
