import axios from "axios";

const API_URL = "http://localhost:8080/productos";

// Obtener todos los productos
export const getProductos = () => axios.get(API_URL);

// Crear producto
export const crearProducto = (producto) => axios.post(API_URL, producto);
