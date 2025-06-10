// services/formationService.js
import api from "./api";

export const getVisibleFormations = async (lang = "es") => {
  const res = await api.get(`/formations?lang=${lang}`);
  return res.data;
};

export const getFormationById = async (id, lang = "es") => {
  try {
    const res = await api.get(`/formations/${id}?lang=${lang}`);
    return res.data;
  } catch (error) {
    if (error.response) {
      throw error;
    } else {
      throw new Error("No se pudo obtener la formación");
    }
  }
};

export const getFormationByIdAllInformation = async (id) => {
  const res = await api.get(`/formations/id/${id}`);
  return res.data;
};

export const getFormationVisibleContent = async (id, lang = "es") => {
  const res = await api.get(`/formations/visible/${id}?lang=${lang}`);
  return res.data;
};

export const getAllFormations = async () => {
  const res = await api.get("/formations/admin");
  return res.data;
};

export const createFormation = async (data) => {
  const res = await api.post("/formations", data);
  return res.data;
};

export const updateFormation = async (id, data) => {
  const res = await api.put(`/formations/${id}`, data);
  return res.data;
};

export const deleteFormation = async (id) => {
  const res = await api.delete(`/formations/${id}`);
  return res.data;
};

export const toggleFormationVisibilityByLanguage = async (id, lang) => {
  const res = await api.patch(`/formations/${id}/visibility/language`, { language: lang });
  return res.data;
};

export const makeFormationVisibleInAllLanguages = async (id) => {
  const res = await api.patch(`/formations/${id}/visibility/all`);
  return res.data;
};



// 🔹 FUNCIONES PARA MODULOS

export const createModule = async (data) => {
  const res = await api.post("/modules", data);
  return res.data;
};


export const deleteModule = async (id) => {
  const res = await api.delete(`/modules/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
};

export const updateModule = async (id, data) => {
  const res = await api.put(`/modules/${id}`, data);
  return res.data;
};

// 🔹 FUNCIONES PARA CLASES DE MODULOS


// Eliminar una clase por ID
export const deleteClassById = async (id) => {
  const res = await api.delete(`/classes/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.data;
};

export const getClassById = async (id, lang = "es") => {
  const res = await api.get(`/classes/${id}?lang=${lang}`);
  return res.data;
};

export const getClassByIdAdmin = async (id) => {
  const res = await api.get(`/classes/admin/${id}`);
  return res.data;
};


export const createClass = async (data) => {
  const res = await api.post("/classes", data);
  return res.data;
};

export const updateClass = async (classId, classData) => {
  const res = await api.put(`/classes/${classId}`, classData);
  return res.data;
};
