import api from "./api";

// 🔹 Subir video promocional (público)
export const subirVideoPromocional = async (videoFile, title, description = "", onProgress) => {
  const formData = new FormData();
  formData.append("file", videoFile);
  formData.append("title", title);
  formData.append("description", description);

  const response = await api.post("/upload/video-promocional", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return response.data.url;
};

// 🔒 Subir video privado (embebido únicamente)
export const subirVideoPrivado = async (videoFile, title, description = "", onProgress) => {
  const formData = new FormData();
  formData.append("file", videoFile);
  formData.append("title", title);
  formData.append("description", description);

  const response = await api.post("/upload/video-privado", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return response.data.url;
};


// 🗑 Eliminar video de Vimeo por URL
export const eliminarVideoDeVimeo = async (videoUrl) => {
  const response = await api.post("/upload/delete-video", { videoUrl });
  return response.data;
};

// 🔍 Consultar estado del video (por ID de Vimeo)
export const consultarEstadoVideoVimeo = async (videoId) => {
  const response = await api.get(`/upload/video-status/${videoId}`);
  return response.data.status;
};
