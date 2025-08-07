import { useState, useEffect } from "react";
import {
  subirPdfPublico,
} from "../../../services/uploadCloudinary";
import { FaTrashAlt, FaFilePdf } from "react-icons/fa";
import "./UploadPdfPublicoField.css";

const UploadPdfPublicoField = ({
  activeLang,
  pdfUrl,
  setPdfUrl,
  publicId,
  setPublicId,
  onMarkForDeletion = () => {},
}) => {
  const [file, setFile] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file || !titulo.trim()) {
      alert("Debes escribir un título y seleccionar un archivo.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const { url, public_id } = await subirPdfPublico(file, titulo.trim());

      setUploadProgress(100);
      setPdfUrl((prev) => ({
        ...prev,
        [activeLang]: { url, title: titulo.trim() },
      }));
      setPublicId((prev) => ({
        ...prev,
        [activeLang]: public_id,
      }));
      setFile(null);
    } catch (err) {
      console.error("❌ Error subiendo PDF:", err);
      setError("Error al subir el PDF. Intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    const id = publicId?.[activeLang];
    if (!id) return;

    // ❌ Ya no eliminamos el archivo directamente
    onMarkForDeletion(id); // 🟡 Marcamos como pendiente de eliminar
    setPdfUrl((prev) => ({ ...prev, [activeLang]: null }));
    setPublicId((prev) => ({ ...prev, [activeLang]: "" }));
    setTitulo("");
    setFile(null);
    setUploadProgress(0);
  };

  const current = pdfUrl?.[activeLang];
  const currentUrl = current?.url || "";
  const tituloMostrado = current?.title || "";

  useEffect(() => {
  }, [pdfUrl, activeLang, uploading]);

  return (
    <div className="upload-pdf-field">
      <label className="label-formulario">
        📄 PDF de presentación ({activeLang})
      </label>
      {current && !uploading ? (
        <div className="pdf-file-card cargado">
          <FaFilePdf className="file-icon" />
          <div className="file-info">
            <span className="file-name">{tituloMostrado}</span>
            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              className="boton-secundario ver-link"
            >
              📄 Ver PDF
            </a>
          </div>
          <button className="boton-eliminar" onClick={handleDelete}>
            <FaTrashAlt />
          </button>
        </div>
      ) : (
        <>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <input
            type="text"
            placeholder={`Título (${activeLang})`}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            disabled={uploading}
          />
          <button
            type="button"
            onClick={handleUpload}
            className="boton-secundario"
            disabled={uploading || !file || !titulo.trim()}
          >
            {uploading ? "Subiendo..." : "📤 Subir PDF"}
          </button>
        </>
      )}

      {uploading && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
            {uploadProgress}%
          </div>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default UploadPdfPublicoField;
