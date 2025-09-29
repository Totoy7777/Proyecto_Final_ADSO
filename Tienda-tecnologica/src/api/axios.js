import axios from "axios";

const runtimeConfiguredBase = (() => {
  try {
    return window?.localStorage?.getItem("adso_api_base") ?? null;
  } catch (error) {
    console.warn("No fue posible leer adso_api_base de localStorage", error);
    return null;
  }
})();

const DEFAULT_API_BASE = "https://unamazedly-demure-veola.ngrok-free.dev/api";

export const API_BASE =
  import.meta.env.VITE_API_URL ?? runtimeConfiguredBase ?? DEFAULT_API_BASE;

export const NGROK_SKIP_HEADER = {
  "ngrok-skip-browser-warning": "true",
};

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const headers = config.headers ?? {};
  if (typeof headers.set === "function") {
    headers.set("ngrok-skip-browser-warning", "true");
    return config;
  }
  config.headers = {
    ...NGROK_SKIP_HEADER,
    ...headers,
  };
  return config;
});

export default api;
