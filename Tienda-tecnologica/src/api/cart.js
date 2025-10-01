import api from "./axios";

export const getActiveCart = (userId) =>
  api.get(`/cart/active/${userId}`).then((r) => r.data);

export const addItem = (payload) =>
  api.post("/cart/add", payload).then((r) => r.data);

export const updateItem = (payload) =>
  api.post("/cart/update", payload).then((r) => r.data);

export const removeItem = (payload) =>
  api.post("/cart/remove", payload).then((r) => r.data);

export const checkout = (payload) =>
  api.post("/cart/checkout", payload).then((r) => r.data);
