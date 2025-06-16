// services/uploadCloudinary.js
import api from "./api";

// Subida de PDF público (cursos)
export const subirPdfPublico = async (archivo) => {
  const data = new FormData();
  data.append("pdf", archivo);
  console.log("📤 Subiendo PDF público:", archivo);

  try {
    const res = await api.post("/cloudinary/upload-pdf-publico", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      url: res.data.url,
      public_id: res.data.public_id,
    };
  } catch (error) {
    console.error("❌ Error al subir PDF público:", error.response?.data || error.message);
    throw new Error("No se pudo subir el PDF público");
  }
};

// Subida de PDF privado (clases)
export const subirPdfPrivado = async (archivo, titulo) => {
  const data = new FormData();
  data.append("pdf", archivo);

  const nombreNormalizado = titulo
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .normalize("NFD") // Elimina acentos
    .replace(/[\u0300-\u036f]/g, "");

  data.append("public_id", nombreNormalizado); // ✅ Acá lo mandás al backend

  console.log("📤 Subiendo PDF privado:", archivo);

  try {
    const res = await api.post("/cloudinary/upload-pdf-privado", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      url: res.data.url,
      public_id: res.data.public_id,
    };
  } catch (error) {
    console.error("❌ Error al subir PDF privado:", error.response?.data || error.message);
    throw new Error("No se pudo subir el PDF privado");
  }
};


// 🗑 Eliminar archivo (cualquier tipo)
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
