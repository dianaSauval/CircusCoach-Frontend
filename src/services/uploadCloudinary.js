// services/uploadCloudinary.js

import api from "./api";

// Subir PDF a Cloudinary
export const subirPdfDesdeFrontend = async (archivo) => {
  const data = new FormData();
  data.append("pdf", archivo);
  console.log("📤 Enviando PDF desde frontend:", archivo);

  try {
    const res = await api.post("/cloudinary/upload-pdf", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      url: res.data.url,
      public_id: res.data.public_id,
    };
  } catch (error) {
    console.error("❌ Error al subir PDF:", error.response?.data || error.message);
    throw new Error("No se pudo subir el PDF");
  }
};

// Eliminar archivo
export const eliminarArchivoDesdeFrontend = async (public_id, resource_type = "raw") => {
  try {
    const res = await api.delete("/cloudinary/delete", {
      data: { public_id, resource_type },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error al eliminar archivo:", error.response?.data || error.message);
    throw new Error("No se pudo eliminar el archivo");
  }
};
