// src/services/uploadVimeoService.js
import api from "./api"; // en vez de axios directo

export const subirVideoAVimeo = async (videoFile, title, description, onProgress) => {
  const formData = new FormData();
  formData.append("file", videoFile);
  formData.append("title", title);
  formData.append("description", description);
  
const response = await api.post(
  `${import.meta.env.VITE_API_URL}/upload/upload-video`,

    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }
  );

  return response.data.url; // el link de Vimeo que te devuelve tu backend
};


export const eliminarVideoDeVimeo = async (videoUrl) => {
  const response = await api.post("/upload/delete-video", { videoUrl });
  return response.data;
};