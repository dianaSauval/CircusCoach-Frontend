import api from "./api";

// 🔹 Obtener todos los bonos (admin)
export const getAllDiscounts = async () => {
  const res = await api.get("/discounts");
  return res.data;
};

// 🔹 Obtener bonos activos (público / frontend)
export const getActiveDiscounts = async () => {
  const res = await api.get("/discounts/activos");
  return res.data;
};

// 🔹 Obtener bono por ID (público / frontend)
export const getDiscountById = async (id) => {
  const res = await api.get(`/discounts/${id}`);
  return res.data;
};

// 🔹 Crear un nuevo bono (admin)
export const createDiscount = async (data) => {
  const res = await api.post("/discounts", data);
  return res.data;
};

// 🔹 Actualizar bono existente (admin)
export const updateDiscount = async (id, data) => {
  const res = await api.put(`/discounts/${id}`, data);
  return res.data;
};

// 🔹 Eliminar bono (admin)
export const deleteDiscount = async (id) => {
  const res = await api.delete(`/discounts/${id}`);
  return res.data;
};
