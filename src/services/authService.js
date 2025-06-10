// services/authService.js
import api from "./api";

// 🔐 Login
export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

// 🔐 Registro
export const registerUser = async (userData) => {
  const res = await api.post("/users", userData);
  return res.data;
};

// 🔐 Recuperación
export const requestPasswordReset = async (email) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await api.post(`/auth/reset-password/${token}`, { newPassword });
  return res.data;
};

// 🔐 Token helpers
export const saveToken = (token) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};


