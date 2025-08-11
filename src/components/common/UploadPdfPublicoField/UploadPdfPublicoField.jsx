import { useState, useEffect } from "react";
import { subirPdfPublico } from "../../../services/uploadCloudinary";
import { FaTrashAlt, FaFilePdf } from "react-icons/fa";
import "./UploadPdfPublicoField.css";

const UploadPdfPublicoField = ({
  activeLang,
  pdfUrl,
  setPdfUrl,
  publicId,
  setPublicId,
  onMarkForDeletion = () => {},
  onTempUpload = () => {},
  isTempPublicId = () => false,
  onDeleteTempNow = async () => {},
  originalPublicId = {},
}) => {
  const [file, setFile] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 👉 NUEVO: “ocultar visualmente” por idioma sin tocar el estado del padre
  const [hiddenByLang, setHiddenByLang] = useState({});

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

      // Si había uno previo, lo marcamos para borrar al guardar
      const prevId = publicId?.[activeLang];
      if (prevId && prevId !== public_id) {
        onMarkForDeletion(prevId);
      }

      // Guardamos el nuevo en el estado del padre
      setPdfUrl((prev) => ({
        ...prev,
        [activeLang]: { url, title: titulo.trim() },
      }));
      setPublicId((prev) => ({
        ...prev,
        [activeLang]: public_id,
      }));

      // Track temporal para cancel
      onTempUpload(public_id);

      // Si estaba “soft hidden” por un borrado previo, lo volvemos a mostrar
      setHiddenByLang((prev) => ({ ...prev, [activeLang]: false }));

      setFile(null);
    } catch (err) {
      console.error("❌ Error subiendo PDF:", err);
      setError("Error al subir el PDF. Intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const id = publicId?.[activeLang];
    if (!id) return;

    const isOriginal = originalPublicId?.[activeLang] === id;
    const isTemp = isTempPublicId?.(id);

    if (isTemp && !isOriginal) {
      // 🧽 nuevo en esta edición → borrar YA de Cloudinary y limpiar estado padre
      await onDeleteTempNow?.(id);
      setPdfUrl((prev) => ({ ...prev, [activeLang]: null }));
      setPublicId((prev) => ({ ...prev, [activeLang]: "" }));
      setTitulo("");
      setFile(null);
      setUploadProgress(0);
    } else {
      // 🏷️ existente → marcar para borrar al guardar y VACÍAR en el padre
      onMarkForDeletion(id);
      // Vaciar el estado para que prepareDataForSave mande string vacío
      setPdfUrl((prev) => ({ ...prev, [activeLang]: "" }));
      setPublicId((prev) => ({ ...prev, [activeLang]: "" }));
      // (Opcional) mantener el ocultado visual por si tenés UI condicionada:
      setHiddenByLang((prev) => ({ ...prev, [activeLang]: true }));
    }
  };

  // Normalizamos: si el valor viene como string, lo convertimos a objeto
  const rawCurrent = pdfUrl?.[activeLang];
  const current =
    typeof rawCurrent === "string"
      ? { url: rawCurrent, title: "" }
      : rawCurrent;

  // Si está “soft hidden”, nos comportamos como si no hubiera PDF
  const isHidden = !!hiddenByLang[activeLang];
  const currentUrl = !isHidden ? current?.url || "" : "";
  const tituloMostrado = !isHidden ? current?.title || "" : "";

  useEffect(() => {}, [pdfUrl, activeLang, uploading]);

  return (
    <div className="upload-pdf-field">
      <label className="label-formulario">
        📄 PDF de presentación ({activeLang})
      </label>

      {currentUrl && !uploading ? (
        <div className="pdf-file-card cargado">
          <FaFilePdf className="file-icon" />
          <div className="file-info">
            <span className="file-name">{tituloMostrado || "PDF"}</span>
            <a
              href={currentUrl}
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
            onClick={handleDelete}
          >
            <FaTrashAlt />
          </button>
        </div>
      ) : (
        <>
          <input
            type="file"
            accept=".pdf,application/pdf"
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
