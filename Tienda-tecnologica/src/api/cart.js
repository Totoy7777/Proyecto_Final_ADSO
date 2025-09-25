import api from "./axios";

export const getActiveCart = (userId) =>
  api.get(`/cart/active/${userId}`).then((r) => r.data);

export const addItem = (userId, productId, cantidad) =>
  api.post("/cart/add", { userId, productId, cantidad }).then((r) => r.data);

export const removeItem = (userId, productId) =>
  api.post("/cart/remove", { userId, productId }).then((r) => r.data);

export const checkout = (userId) =>
  api.post("/cart/checkout", { userId }).then((r) => r.data);
