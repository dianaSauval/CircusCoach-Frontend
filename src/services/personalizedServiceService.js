import api from "./api";

// ===============================
// PÚBLICO
// ===============================

// Crear una nueva solicitud personalizada
export const createPersonalizedServiceRequest = async (requestData) => {
  const res = await api.post("/personalized-services/requests", requestData);
  return res.data;
};

// ===============================
// ADMIN
// ===============================

// Obtener todas las solicitudes (opcionalmente filtradas)
export const getAllPersonalizedServiceRequests = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.status) {
    params.append("status", filters.status);
  }

  if (filters.serviceType) {
    params.append("serviceType", filters.serviceType);
  }

  if (filters.resetEditionId) {
    params.append("resetEdition", filters.resetEditionId);
  }

  const query = params.toString();
  const url = query
    ? `/personalized-services/requests?${query}`
    : "/personalized-services/requests";

  const res = await api.get(url);
  return res.data;
};

// Obtener una solicitud por id
export const getPersonalizedServiceRequestById = async (requestId) => {
  const res = await api.get(`/personalized-services/requests/${requestId}`);
  return res.data;
};

// 🔥 NUEVO
export const setCustomPriceForRequest = async (requestId, price) => {
  const res = await api.patch(
    `/personalized-services/requests/${requestId}/set-price`,
    { price }
  );
  return res.data;
};

// Aprobar solicitud
export const approvePersonalizedServiceRequest = async (
  requestId,
  payload = {}
) => {
  const res = await api.patch(
    `/personalized-services/requests/${requestId}/approve`,
    payload
  );
  return res.data;
};

// Rechazar solicitud
export const rejectPersonalizedServiceRequest = async (
  requestId,
  payload = {}
) => {
  const res = await api.patch(
    `/personalized-services/requests/${requestId}/reject`,
    payload
  );
  return res.data;
};