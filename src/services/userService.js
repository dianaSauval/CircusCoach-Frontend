// services/userService.js
import api from "./api";

// ✅ Obtener perfil del usuario autenticado
export const getUserProfile = async () => {
  const response = await api.get("/auth/perfil");
  return response.data;
};

// ✅ Obtener cursos y formaciones compradas
export const getMisCompras = async () => {
  const res = await api.get("/users/mis-compras");
  return res.data;
};

// ==========================
// 📘 PROGRESO EN CURSOS
// ==========================

// ✅ Marcar clase de curso como completada
export const marcarClaseCurso = async (userId, courseId, classId) => {
  const response = await api.post(`/users/${userId}/progreso-curso/${courseId}`, {
    classId,
  });
  return response.data;
};

// ✅ Desmarcar clase de curso
export const desmarcarClaseCurso = async (userId, courseId, classId) => {
  const response = await api.delete(`/users/${userId}/progreso-curso/${courseId}/${classId}`);
  return response.data;
};

// ✅ Obtener progreso del usuario en un curso
export const obtenerProgresoCurso = async (userId, courseId) => {
  const response = await api.get(`/users/${userId}/progreso-curso/${courseId}`);
  return response.data;
};

// ✅ Comprar curso
export const comprarCurso = async (userId, courseId) => {
  const response = await api.post(`/users/${userId}/comprar/${courseId}`);
  return response.data;
};

// ==========================
// 🧭 PROGRESO EN FORMACIONES
// ==========================

// ✅ Marcar clase de formación como completada
export const marcarClaseFormacion = async (userId, formationId, classId) => {
  const response = await api.post(`/users/${userId}/progreso-formacion/${formationId}`, {
    classId,
  });
  return response.data;
};

// ✅ Desmarcar clase de formación
export const desmarcarClaseFormacion = async (userId, formationId, classId) => {
  const response = await api.delete(`/users/${userId}/progreso-formacion/${formationId}/${classId}`);
  return response.data;
};

// ✅ Obtener progreso del usuario en una formación
export const obtenerProgresoFormacion = async (userId, formationId) => {
  const response = await api.get(`/users/${userId}/progreso-formacion/${formationId}`);
  return response.data;
};
