// components/common/UploadPdfPrivadoField.jsx
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaFilePdf, FaTrashAlt } from "react-icons/fa";
import { subirPdfPrivado } from "../../../services/uploadCloudinary";
import "./UploadPdfPrivadoField.css";

// 🔧 Deriva el public_id desde la URL de Cloudinary (soporta /raw/upload y /upload)
const getPublicIdFromUrl = (url) => {
  if (!url) return "";
  try {
    const clean = url.split("?")[0]; // quita querystring

    const candidates = ["/raw/upload/", "/upload/"];
    let pivot = -1;
    for (const seg of candidates) {
      const idx = clean.indexOf(seg);
      if (idx >= 0) {
        pivot = idx + seg.length;
        break;
      }
    }
    if (pivot < 0) return "";

    // Ej: https://res.cloudinary.com/<cloud>/raw/upload/v1699999/carpeta/archivo.pdf
    let path = clean.substring(pivot);
    const parts = path.split("/");

    // quita versión v123456 si aparece
    if (parts[0] && /^v\d+$/i.test(parts[0])) parts.shift();

    path = parts.join("/");

    // quita extensión (.pdf)
    return path.replace(/\.[^/.]+$/, ""); // carpeta/archivo (sin extensión)
  } catch {
    return "";
  }
};

const UploadPdfPrivadoField = ({
  activeTab,
  onPdfUploaded,
  onTempPublicId,
  existingPdfs = [],
  setPdfs,
  isTempPublicId = () => false,
  onDeleteTempNow = async () => {},
  onMarkForDeletion = () => {},
}) => {
  const [pdfInputs, setPdfInputs] = useState([]);

  const addNewPDF = () => {
    setPdfInputs((prev) => [
      ...prev,
      {
        _id: uuidv4(),
        file: null,
        title: { es: "", en: "", fr: "" },
        description: { es: "", en: "", fr: "" },
        uploading: false,
      },
    ]);
  };

  const handleFileChange = (index, file) => {
    const updated = [...pdfInputs];
    updated[index].file = file;
    setPdfInputs(updated);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...pdfInputs];
    updated[index][field][activeTab] = value;
    setPdfInputs(updated);
  };

  const subirPDF = async (index) => {
    const pdf = pdfInputs[index];
    if (!pdf.file) return alert("Seleccioná un archivo PDF primero.");

    const titulo = pdf.title?.[activeTab]?.trim();
    if (!titulo) return alert("Escribí un título antes de subir el PDF.");

    try {
      const updated = [...pdfInputs];
      updated[index].uploading = true;
      setPdfInputs(updated);

      const { url, public_id } = await subirPdfPrivado(pdf.file, titulo);

      const nuevoPdf = {
        _id: pdf._id,
        url: { es: "", en: "", fr: "" },
        public_id: { es: "", en: "", fr: "" },
        title: pdf.title,
        description: pdf.description,
      };
      nuevoPdf.url[activeTab] = url;
      nuevoPdf.public_id[activeTab] = public_id;

      onTempPublicId(public_id);
      onPdfUploaded(nuevoPdf);

      setPdfInputs((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("❌ Error al subir PDF:", err);
      alert("Error al subir el PDF.");
    }
  };

  const eliminarPdf = async (pdfId) => {
    const pdf = existingPdfs.find((p) => p._id === pdfId);

    // 1) obtener un public_id confiable (del estado o derivado de la URL)
    const publicId =
      pdf?.public_id?.[activeTab] ||
      getPublicIdFromUrl(pdf?.url?.[activeTab] || "");

    // 2) decidir: si es temporal → borrar YA; si es persistente → marcar para borrar al Guardar
    if (publicId) {
      try {
        const esTemp = isTempPublicId(publicId);
        if (esTemp) {
          await onDeleteTempNow(publicId);
        } else {
          onMarkForDeletion(publicId);
        }
      } catch (error) {
        console.warn("⚠️ Error al gestionar eliminación de PDF:", error);
      }
    }

    // 3) limpiar visualmente SOLO el idioma activo
    const listaActual = Array.isArray(existingPdfs) ? existingPdfs : [];
    const actualizada = listaActual.map((p) => {
      if (p._id !== pdfId) return p;
      return {
        ...p,
        url: { ...(p.url || {}), [activeTab]: "" },
        public_id: { ...(p.public_id || {}), [activeTab]: "" },
        title: { ...(p.title || {}), [activeTab]: "" },
        description: { ...(p.description || {}), [activeTab]: "" },
      };
    });
    setPdfs(actualizada);
  };

  return (
    <div>
      {Array.isArray(existingPdfs) &&
        existingPdfs
          .filter((pdf) => pdf?.url?.[activeTab])
          .map((pdf) => (
            <div className="upload-pdf-field" key={pdf._id}>
              <div className="pdf-file-card cargado">
                <FaFilePdf className="file-icon" />
                <div className="file-info">
                  <span className="file-name">
                    {pdf.title?.[activeTab] || "Sin título"}
                  </span>
                  <a
                    href={pdf.url?.[activeTab]}
                    target="_blank"
                    rel="noreferrer"
                    className="boton-secundario ver-link"
                  >
                    📄 Ver PDF
                  </a>
                </div>
                <button
                  type="button"
                  className="boton-eliminar"
                  onClick={(e) => {
                    e.preventDefault();
                    eliminarPdf(pdf._id);
                  }}
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}

      {pdfInputs.map((pdf, i) => (
        <div key={pdf._id} className="pdf-entry">
          <div>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(i, e.target.files[0])}
            />
            <input
              type="text"
              placeholder="Título"
              value={pdf.title[activeTab]}
              onChange={(e) => handleInputChange(i, "title", e.target.value)}
            />
            <input
              type="text"
              placeholder="Descripción"
              value={pdf.description[activeTab]}
              onChange={(e) =>
                handleInputChange(i, "description", e.target.value)
              }
            />
          </div>
          <div className="buttons">
            <button
              className="boton-agregar"
              type="button"
              onClick={() => subirPDF(i)}
              disabled={pdf.uploading}
            >
              {pdf.uploading ? "Subiendo..." : "📤 Subir PDF"}
            </button>
            <button
              type="button"
              className="boton-eliminar"
              onClick={() =>
                setPdfInputs((prev) => prev.filter((_, idx) => idx !== i))
              }
            >
              ❌ Quitar
            </button>
          </div>
        </div>
      ))}

      <button type="button" className="boton-secundario" onClick={addNewPDF}>
        ➕ Agregar PDF
      </button>
    </div>
  );
};

export default UploadPdfPrivadoField;
