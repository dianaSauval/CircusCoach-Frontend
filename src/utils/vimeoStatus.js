// utils/vimeoStatus.js
// utils/vimeoStatus.js
import api from "../services/api";

export async function checkVimeoAvailability(videoId) {
  try {
    const response = await api.get(`/upload/video-status/${videoId}`);
    return response.data.status === "available" ? "ready" : "processing";
  } catch (error) {
    console.error("Error al verificar el estado en Vimeo:", error);
    return "processing";
  }
}
