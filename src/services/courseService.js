// services/courseService.js
import api from "./api";

// Cursos
export const getCourses = async (lang) => {
  const res = await api.get(`/courses/visible?lang=${lang}`);
  return res.data;
};

export const getCourseById = async (id, lang = "es") => {
  const res = await api.get(`/courses/${id}?lang=${lang}`);
  return res.data;
};


export const getAllCourses = async () => {
  const res = await api.get("/courses/admin");
  return res.data;
};

export const createCourse = async (data) => {
  const res = await api.post("/courses", data);
  return res.data;
};

export const updateCourse = async (id, data) => {
  const res = await api.put(`/courses/${id}`, data);
  return res.data;
};

export const deleteCourse = async (id) => {
  const res = await api.delete(`/courses/${id}`);
  return res.data;
};

export const toggleCourseVisibility = async (courseId, lang) => {
  const res = await api.patch(`/courses/${courseId}/visibility/language`, {
    language: lang,
  });
  return res.data;
};


// Clases de curso
export const createCourseClass = async (courseId, data) => {
  const res = await api.post(`/course-classes/${courseId}`, data);
  return res.data;
};

export const updateCourseClass = async (classId, data) => {
  const res = await api.put(`/course-classes/${classId}`, data);
  return res.data;
};

export const deleteCourseClass = async (classId) => {
  const res = await api.delete(`/course-classes/${classId}`);
  return res.data;
};

export const toggleCourseClassVisibility = async (classId, lang) => {
  const res = await api.patch(`/course-classes/${classId}/visibility/${lang}`);
  return res.data;
};

// ✅ NUEVAS funciones para clases visibles y detalle por idioma
export const getVisibleCourseClasses = async (courseId, lang = "es") => {
  const res = await api.get(`/course-classes/visible/${courseId}?lang=${lang}`);
  return res.data;
};

export const getCourseClassById = async (classId, lang = "es") => {
  const res = await api.get(`/course-classes/${classId}?lang=${lang}`);
  return res.data;
};
