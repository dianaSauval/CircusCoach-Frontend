// services/uploadCloudinary.js
import api from "./api";
import { v4 as uuidv4 } from "uuid";

// Subida de PDF público (cursos)
export const subirPdfPublico = async (archivo, titulo) => {
  const data = new FormData();
  data.append("pdf", archivo);

  const extension = archivo.name.split(".").pop(); // pdf
  const nombreNormalizado = titulo
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .normalize("NFD") // elimina acentos
    .replace(/[\u0300-\u036f]/g, ""); // elimina tildes

  const publicId = `${nombreNormalizado}-${uuidv4()}.${extension}`;
  data.append("public_id", publicId);

  console.log("📤 Subiendo PDF público:", archivo.name, "como", publicId);

  try {
    const res = await api.post("/cloudinary/upload-pdf-publico", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      url: res.data.url,
      public_id: res.data.public_id,
    };
  } catch (error) {
    console.error(
      "❌ Error al subir PDF público:",
      error.response?.data || error.message,
    );
    throw new Error("No se pudo subir el PDF público");
  }
};

// Subida de PDF privado (clases)
export const subirPdfPrivado = async (archivo, titulo) => {
  const data = new FormData();
  data.append("pdf", archivo);

  const extension = archivo.name.split(".").pop(); // pdf
  const nombreNormalizado = titulo
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const publicId = `${nombreNormalizado}-${uuidv4()}.${extension}`;
  data.append("public_id", publicId);

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
    console.error(
      "❌ Error al subir PDF privado:",
      error.response?.data || error.message,
    );
    throw new Error("No se pudo subir el PDF privado");
  }
};

// 🗑 Eliminar archivo (cualquier tipo)
export const eliminarArchivoDesdeFrontend = async (
  public_id,
  resource_type = "raw",
) => {
  try {
    const res = await api.delete("/cloudinary/delete", {
      data: { public_id, resource_type },
    });
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error al eliminar archivo:",
      error.response?.data || error.message,
    );
    throw new Error("No se pudo eliminar el archivo");
  }
};

// 📸 Subida de imagen de curso (flyer)
export const subirImagenCurso = async (archivo, titulo) => {
  const data = new FormData();
  data.append("file", archivo);

  const nombreNormalizado = titulo
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  data.append("public_id", nombreNormalizado);

  console.log(
    "📤 Subiendo imagen de curso:",
    archivo.name,
    "como",
    nombreNormalizado,
  );

  try {
    const res = await api.post("/cloudinary/upload-imagen-curso", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      url: res.data.url,
      public_id: res.data.public_id,
    };
  } catch (error) {
    console.error(
      "❌ Error al subir imagen de curso:",
      error.response?.data || error.message,
    );
    throw new Error("No se pudo subir la imagen del curso");
  }
};

export const obtenerUrlPdfPrivado = async (classId, index, lang) => {
  const response = await api.get(
    `/cloudinary/privado/${classId}/${index}/${lang}`,
  );
  return response.data.url; // ✅ ahora te devuelve la URL directa del PDF
};

export const obtenerUrlPdfPrivadoCurso = async (classId, index, lang) => {
  try {
    const response = await api.get(
      `/cloudinary/pdf-curso-privado/${classId}/${index}/${lang}`,
    );
    return response.data.url;
  } catch (error) {
    console.error("❌ Error al obtener PDF privado de curso:", error);
    throw new Error("No se pudo cargar el PDF del curso");
  }
};

// 📘 Subida de PDF de libro
export const subirPdfLibro = async (archivo, titulo) => {
  const data = new FormData();
  data.append("pdf", archivo);

  const extension = archivo.name.split(".").pop(); // pdf
  const nombreNormalizado = titulo
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const publicId = `${nombreNormalizado}-${uuidv4()}.${extension}`;
  data.append("public_id", publicId);

  console.log("📤 Subiendo PDF de libro:", archivo.name, "como", publicId);

  try {
    const res = await api.post("/cloudinary/upload-pdf-libro", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      url: res.data.url,
      public_id: res.data.public_id,
    };
  } catch (error) {
    const status = error.response?.status;
    const payload = error.response?.data;

    // ✅ Caso: archivo demasiado grande (backend -> 413)
    if (status === 413 || payload?.errorCode === "BOOK_PDF_TOO_LARGE") {
      const maxMb = payload?.maxMb || 10;
      const msg =
        payload?.error ||
        `El PDF supera el máximo permitido (${maxMb} MB). Comprimilo e intentá nuevamente.`;

      const e = new Error(msg);
      e.code = "BOOK_PDF_TOO_LARGE";
      e.maxMb = maxMb;
      e.sizeMb = Number((archivo.size / (1024 * 1024)).toFixed(2));
      throw e;
    }

    // ✅ Caso: no es PDF (si lo implementaste en backend)
    if (payload?.errorCode === "BOOK_PDF_INVALID_TYPE") {
      const e = new Error(
        payload?.error || "Archivo inválido. Solo se permiten PDFs.",
      );
      e.code = "BOOK_PDF_INVALID_TYPE";
      throw e;
    }

    console.error("❌ Error al subir PDF de libro:", payload || error.message);

    const e = new Error(payload?.error || "No se pudo subir el PDF del libro");
    e.code = "BOOK_PDF_UPLOAD_ERROR";
    throw e;
  }
};
