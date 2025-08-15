import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { subirImagenCurso } from "../../../services/uploadCloudinary";
import "./UploadImagenField.css";

const UploadImagenField = ({
  activeLang,
  value,                   // url actual
  publicIdActual = "",     // public_id actual si lo sabés (opcional)
  onChange,                // (url, publicId) cuando SUBO una nueva
  onMarkForDeletion,       // (publicId) cuando elimino una existente (persistida)
  onDeleteTempNow,         // (publicId) cuando elimino una nueva (temporal)
  isTempPublicId = () => false, // (id)=>boolean para distinguir temp vs persistida
}) => {
  const [file, setFile] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !titulo.trim()) {
      alert("Debes escribir un título y seleccionar una imagen.");
      return;
    }
    setUploading(true);
    try {
      const result = await subirImagenCurso(file, titulo.trim());
      onChange?.(result.url, result.public_id); // 👈 pasamos ambos
      setFile(null);
      setTitulo("");
    } catch (err) {
      alert("❌ Error al subir la imagen");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!value) return;

    // ⚠️ Necesitamos un public_id. Si no llega por prop, intentamos sacarlo de la URL.
    let pid = publicIdActual;
    if (!pid) {
      const m = value.match(/\/upload\/(?:v\d+\/)?([^.]*)\.(?:jpg|jpeg|png|webp)/i);
      pid = m?.[1] || "";
    }
    if (!pid) {
      alert("❌ No se pudo obtener el public_id de la imagen.");
      return;
    }

    // Si es una imagen TEMPORAL => borrar YA.
    if (isTempPublicId?.(pid)) {
      await onDeleteTempNow?.(pid);
      return;
    }

    // Si es una imagen PERSISTIDA => marcar para borrar al guardar y limpiar visualmente.
    onMarkForDeletion?.(pid);
  };

  return (
    <div className="upload-imagen-field">
      <label className="label-formulario">Imagen de presentación ({activeLang})</label>

      {value ? (
        <div className="uploaded-image-preview">
          <img
            src={value}
            alt="Imagen subida"
            style={{ maxWidth: "200px", borderRadius: "8px" }}
          />
          <button
            className="boton-eliminar"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
          >
            <FaTrashAlt /> Eliminar
          </button>
        </div>
      ) : (
        <>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          <input
            type="text"
            placeholder={`Título de la imagen (${activeLang})`}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            disabled={uploading}
            style={{ marginTop: "0.5rem", width: "100%" }}
          />
          {file && (
            <button className="boton-secundario" onClick={handleUpload} disabled={uploading}>
              {uploading ? "Subiendo..." : "Subir Imagen"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default UploadImagenField;
