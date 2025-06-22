// components/common/UploadPdfPrivadoField.jsx
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaTrashAlt } from "react-icons/fa";
import {
  subirPdfPrivado,
  eliminarArchivoDesdeFrontend,
} from "../../../services/uploadCloudinary";
import "./UploadPdfPrivadoField.css";

const UploadPdfPrivadoField = ({
  activeTab,
  onPdfUploaded,
  onTempPublicId,
  existingPdfs = [],
  setPdfs,
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
    const publicId = pdf?.public_id?.[activeTab];
    if (publicId) await eliminarArchivoDesdeFrontend(publicId);
    setPdfs((prev) => {
      if (!Array.isArray(prev)) return [];
      return prev.filter((p) => p._id !== pdfId);
    });
  };

  return (
    <div>
      {Array.isArray(existingPdfs) &&
        existingPdfs
          .filter((pdf) => pdf?.url?.[activeTab])
          .map((pdf) => (
            <div key={pdf._id} className="video-preview-item">
              <p>
                <strong>{pdf.title?.[activeTab] || "Sin título"}</strong>
              </p>
              <p style={{ fontStyle: "italic" }}>
                {pdf.description?.[activeTab] || "Sin descripción"}
              </p>
              <button
                type="button"
                className="delete-button"
                onClick={() => eliminarPdf(pdf._id)}
              >
                <FaTrashAlt />
              </button>
            </div>
          ))}

      {pdfInputs.map((pdf, i) => (
        <div key={pdf._id} className="pdf-entry">
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
          <button
            type="button"
            onClick={() => subirPDF(i)}
            disabled={pdf.uploading}
          >
            {pdf.uploading ? "Subiendo..." : "📤 Subir PDF"}
          </button>
        </div>
      ))}

      <button type="button" onClick={addNewPDF}>
        ➕ Agregar PDF
      </button>
    </div>
  );
};

export default UploadPdfPrivadoField;
