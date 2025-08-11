// components/common/UploadPdfPrivadoField.jsx
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaFilePdf, FaTrashAlt } from "react-icons/fa";
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

    if (publicId) {
      try {
        await eliminarArchivoDesdeFrontend(publicId);
      } catch (error) {
        console.warn("⚠️ Error al eliminar archivo desde Cloudinary:", error);
      }
    }

    setPdfs((prev) => {
      const listaActual = Array.isArray(prev) ? prev : [];

      return listaActual.map((p) => {
        if (p._id !== pdfId) return p;

        const newPdf = { ...p };

        newPdf.url = { ...newPdf.url, [activeTab]: "" };
        newPdf.public_id = { ...newPdf.public_id, [activeTab]: "" };
        newPdf.title = { ...newPdf.title, [activeTab]: "" };
        newPdf.description = { ...newPdf.description, [activeTab]: "" };

        return newPdf;
      });
    });
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
                  className="boton-eliminar"
                  onClick={() => eliminarPdf(pdf._id)}
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
