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
  api.get("/admin/orders", authConfig(authHeader)).then((res) => {
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    if (data && typeof data === "object") return [data];
    return [];
  });

export const getOrderById = (orderId, authHeader) =>
  api
    .get(`/admin/orders/${orderId}`, authConfig(authHeader))
    .then((res) => res.data);

export const getMyOrders = (userId, authHeader) =>
  api
    .get(`/orders/user/${userId}`, authConfig(authHeader))
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

export const addShipmentEvent = (orderId, payload, authHeader) =>
  api
    .post(`/admin/orders/${orderId}/shipment/events`, payload, authConfig(authHeader))
    .then((res) => res.data);

export const deleteMyOrder = (orderId, authHeader) =>
  api.delete(`/orders/${orderId}`, authConfig(authHeader)).then((res) => res.data);

export const deleteAllMyOrders = (userId, authHeader) =>
  api.delete(`/orders/user/${userId}`, authConfig(authHeader)).then((res) => res.data);
