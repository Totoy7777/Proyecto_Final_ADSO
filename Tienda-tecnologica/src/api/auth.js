import api from "./axios";

export const register = (user) =>
  api.post("/users/register", user).then((res) => res.data);

export const login = (email, password) =>
  api.post("/users/login", { email, password }).then((res) => res.data);
