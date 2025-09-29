import api from "./axios";

export const getCategories = () => api.get("/categories").then((r) => r.data);

export const createCategory = (payload) =>
  api.post("/categories", payload).then((r) => r.data);

export default {
  getCategories,
  createCategory,
};
