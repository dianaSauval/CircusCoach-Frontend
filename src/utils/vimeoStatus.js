// utils/vimeoStatus.js
import api from "../services/api";

export async function checkVimeoAvailability(videoId) {
  try {
    const vimeoApiStatus = await api.get(`/upload/video-status/${videoId}`);
    const status = vimeoApiStatus.data.status;

    // Sólo nos interesa saber si ya está disponible
    if (status === "available") return "ready";
    return "processing";
  } catch (error) {
    console.error("Error al verificar el estado en Vimeo:", error);
    return "error";
  }
}
