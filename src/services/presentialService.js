// services/presentialService.js
import api from "./api";

export const getPresentialFormationsByLang = async (lang = "es") => {
  const res = await api.get(`/presential-formations/presencial?lang=${lang}`);
  return res.data;
};

export const getPresentialFormations = async () => {
  const res = await api.get("/presential-formations");
  return res.data;
};


export const createPresentialFormation = async (formationData) => {
  const response = await api.post("/presential-formations", formationData);
  return response.data;
};

export const updatePresentialFormation = async (id, updatedData) => {
  const response = await api.put(`/presential-formations/${id}`, updatedData);
  return response.data;
};

export const deletePresentialFormation = async (id) => {
  const response = await api.delete(`/presential-formations/${id}`);
  return response.data;
};
