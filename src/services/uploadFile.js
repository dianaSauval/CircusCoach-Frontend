import api from "./api"; // Importamos axios para hacer la solicitud

export const uploadFile = async (file, subFolder) => {
  if (!file) {
    console.error("No se seleccionó ningún archivo.");
    return null;
  }

  try {
    // Obtener la firma segura desde el backend
    const timestamp = Math.floor(Date.now() / 1000);
    const response = await api.post("/cloudinary/signature", { folder: `CircusCoach/${subFolder}`, timestamp });

    if (!response.data.signature) {
      throw new Error("No se pudo obtener la firma.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", `CircusCoach/${subFolder}`);
    formData.append("timestamp", response.data.timestamp); // 👈 Usamos el timestamp del backend
    formData.append("signature", response.data.signature);
    formData.append("api_key", "951192131331738"); // 👈 Usamos la API Key correcta

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/dkdhdy9e5/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(`Cloudinary Error: ${data.error?.message || "Error desconocido"}`);
    }

    return data.secure_url; // Devolvemos la URL del archivo subido
  } catch (error) {
    console.error("Error al subir el archivo:", error);
    throw error;
  }
};
