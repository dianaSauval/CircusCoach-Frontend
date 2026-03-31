import api from "./api";

// ===============================
// PÚBLICO
// ===============================

// Obtener ediciones públicas de RESET
export const getPublicResetEditions = async () => {
  const res = await api.get("/reset-editions/public");
  return res.data;
};

// ===============================
// ADMIN
// ===============================

// Obtener todas las ediciones
export const getAllResetEditions = async () => {
  const res = await api.get("/reset-editions/admin");
  return res.data;
};

// Obtener una edición por id
export const getResetEditionById = async (editionId) => {
  const res = await api.get(`/reset-editions/admin/${editionId}`);
  return res.data;
};

// Crear edición
export const createResetEdition = async (editionData) => {
  const res = await api.post("/reset-editions/admin", editionData);
  return res.data;
};

// Actualizar edición
export const updateResetEdition = async (editionId, editionData) => {
  const res = await api.put(`/reset-editions/admin/${editionId}`, editionData);
  return res.data;
};

// Abrir / cerrar manualmente edición
export const toggleResetEditionClosed = async (editionId, manuallyClosed) => {
  const res = await api.patch(
    `/reset-editions/admin/${editionId}/toggle-closed`,
    { manuallyClosed }
  );
  return res.data;
};

// Agregar participante pago
export const addPaidParticipantToResetEdition = async (
  editionId,
  participantData
) => {
  const res = await api.post(
    `/reset-editions/admin/${editionId}/paid-participants`,
    participantData
  );
  return res.data;
};

// Eliminar participante pago
export const removePaidParticipantFromResetEdition = async (
  editionId,
  participantId
) => {
  const res = await api.delete(
    `/reset-editions/admin/${editionId}/paid-participants/${participantId}`
  );
  return res.data;
};

// Eliminar edición (solo realizadas)
export const deleteResetEdition = async (editionId) => {
  const res = await api.delete(`/reset-editions/admin/${editionId}`);
  return res.data;
};