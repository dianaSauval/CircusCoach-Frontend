// src/services/physicalProductService.js
import api from "./api";

// -------------------------
// 🌍 PUBLIC
// -------------------------

// Obtener todos los productos físicos (clientes)
export const getAllPhysicalProducts = async () => {
  const { data } = await api.get("/physical-products");
  return data;
};

// Obtener un producto físico por ID (detalle público)
export const getPhysicalProductById = async (id) => {
  const { data } = await api.get(`/physical-products/${id}`);
  return data;
};

// -------------------------
// 🔐 ADMIN
// -------------------------

// Crear producto físico
export const createPhysicalProduct = async (productData) => {
  const { data } = await api.post("/physical-products/admin", productData);
  return data;
};

// Editar producto físico
export const updatePhysicalProduct = async (id, productData) => {
  const { data } = await api.put(
    `/physical-products/admin/${id}`,
    productData
  );
  return data;
};

// Eliminar producto físico
export const deletePhysicalProduct = async (id) => {
  const { data } = await api.delete(`/physical-products/admin/${id}`);
  return data;
};
