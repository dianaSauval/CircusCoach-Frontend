import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { subirImagenCurso, eliminarArchivoDesdeFrontend } from "../../../services/uploadCloudinary";
import "./UploadImagenField.css";

const UploadImagenField = ({ activeLang, value, onChange }) => {
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
      onChange(result.url);
      setFile(null);
      setTitulo("");
    } catch (err) {
      alert("❌ Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!value) return;

    const match = value.match(/\/upload\/(?:v\d+\/)?ImagenesCursos\/(.+)\.(jpg|jpeg|png|webp)/i);
    const publicId = match ? `ImagenesCursos/${match[1]}` : null;

    if (!publicId) return;

    try {
      await eliminarArchivoDesdeFrontend(publicId, "image");
      onChange("");
    } catch (err) {
      alert("❌ No se pudo eliminar la imagen");
    }
  };

  return (
    <div className="upload-imagen-field">
      <label>Imagen ({activeLang})</label>
      {value ? (
        <div className="uploaded-image-preview">
          <img src={value} alt="Imagen subida" style={{ maxWidth: "200px", borderRadius: "8px" }} />
          <button className="btn red" onClick={handleDelete}>
            <FaTrashAlt /> Eliminar
          </button>
        </div>
      ) : (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <input
            type="text"
            placeholder={`Título de la imagen (${activeLang})`}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            disabled={uploading}
            style={{ marginTop: "0.5rem", width: "100%" }}
          />
          {file && (
            <button className="btn blue" onClick={handleUpload} disabled={uploading}>
              {uploading ? "Subiendo..." : "Subir Imagen"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default UploadImagenField;
