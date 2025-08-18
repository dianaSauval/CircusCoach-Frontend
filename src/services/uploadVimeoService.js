import api from "./api";

/** Utilidad: esperar a que el video esté "available" */
export const esperarDisponibilidadVimeo = async (
  videoId,
  { intervalMs = 3000, maxTries = 40 } = {}
) => {
  let tries = 0;
  while (tries < maxTries) {
    const status = await consultarEstadoVideoVimeo(videoId);
    if (status === "available") return true;
    await new Promise(r => setTimeout(r, intervalMs));
    tries++;
  }
  return false;
};

// 🔹 Subir video promocional (público)
export const subirVideoPromocional = async (videoFile, title, description = "", onProgress) => {
  const formData = new FormData();
  formData.append("file", videoFile);
  formData.append("title", title);
  formData.append("description", description);

  const response = await api.post("/upload/video-promocional", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(percent);
      }
    },
    validateStatus: () => true, // aceptamos 202 también
  });

  // Puede venir 200 con {id, url, player_embed_url} o 202 con {id, status}
  if (response.status === 202) {
    const { id, status } = response.data;
    return { id, status, url: null, player_embed_url: null, processing: true };
  }

  const { id, url, player_embed_url, status } = response.data;
  return { id, url, player_embed_url, status: status || "available", processing: false };
};

// 🔒 Subir video privado (solo embebible en tu web)
export const subirVideoPrivado = async (videoFile, title, description = "", onProgress) => {
  const formData = new FormData();
  formData.append("file", videoFile);
  formData.append("title", title);
  formData.append("description", description);

  const response = await api.post("/upload/video-privado", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(percent);
      }
    },
    validateStatus: () => true,
  });

  if (response.status === 202) {
    const { id, status } = response.data;
    return { id, status, url: null, player_embed_url: null, processing: true };
  }

  const { id, url, player_embed_url, status } = response.data;
  // ⚠️ El backend ya te manda `url` como player (player.vimeo.com). La guardamos tal cual.
  return { id, url, player_embed_url, status: status || "available", processing: false };
};

// 🗑 Eliminar video de Vimeo por URL o por ID
export const eliminarVideoDeVimeo = async (idOrUrl) => {
  // El backend extrae el ID con regex, así que sirve pasar URL completa o solo el ID.
  const response = await api.post("/upload/delete-video", { videoUrl: idOrUrl });
  return response.data; // { success: true }
};

// 🔍 Consultar estado del video (por ID de Vimeo)
export const consultarEstadoVideoVimeo = async (videoId) => {
  const response = await api.get(`/upload/video-status/${videoId}`);
  return response.data.status; // "available" | "uploading" | "transcoding" ...
};

// 🔒 Obtener URL del video privado si el usuario tiene acceso
export const obtenerUrlVideoPrivado = async (classId, index, lang) => {
  try {
    const response = await api.get(`/upload/video/${classId}/${index}/${lang}`);
    // El backend devuelve { url } siendo player.vimeo.com/video/ID
    return response.data.url;
  } catch (error) {
    console.error("❌ Error al obtener video privado:", error.response?.data || error.message);
    throw new Error("No se pudo obtener el video privado");
  }
};
