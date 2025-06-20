import { useState, useEffect } from "react";
import "./UploadVideoField.css";
import {
  subirVideoPrivado,
  eliminarVideoDeVimeo,
} from "../../../services/uploadVimeoService";
import { FaTrashAlt, FaCheckCircle, FaFileVideo } from "react-icons/fa";

const UploadVideoField = ({ activeLang = "es", video, onUploadSuccess }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");

  // 🔁 Cargar valores iniciales del idioma activo
  useEffect(() => {
    setTitle(video?.title?.[activeLang] || "");
    setDescription(video?.description?.[activeLang] || "");
    setVideoUrl(video?.url?.[activeLang] || "");
  }, [activeLang, video]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
  };

  const handleUpload = async () => {
    if (!videoFile) return alert("Seleccioná un archivo de video.");
    if (!title.trim()) return alert("Escribí un título antes de subir.");

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const rawUrl = await subirVideoPrivado(
        videoFile,
        title,
        description,
        (progress) => {
          setUploadProgress(Math.round(progress));
        }
      );

      setUploadProgress(100);
      const publicUrl = rawUrl;

      // 🧠 Actualizamos solo el idioma activo
      const videoPartial = {
        _id: video._id,
        url: { [activeLang]: publicUrl },
        title: { [activeLang]: title },
        description: { [activeLang]: description },
      };

      onUploadSuccess?.(videoPartial);
      setVideoUrl(publicUrl);
      setVideoFile(null);
    } catch (err) {
      console.error("❌ Error subiendo video:", err);
      setError("Error al subir el video. Intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (videoUrl) {
        await eliminarVideoDeVimeo(videoUrl);
      }
    } catch (err) {
      console.warn("❌ No se pudo eliminar el video de Vimeo:", err);
    }

    // Informamos al padre que se borre SOLO este idioma
    const videoPartial = {
      _id: video._id,
      url: { [activeLang]: "" },
      title: { [activeLang]: "" },
      description: { [activeLang]: "" },
    };

    onUploadSuccess?.(videoPartial);
    setVideoUrl("");
    setTitle("");
    setDescription("");
    setVideoFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="upload-video-field">
      {!videoUrl && !uploading ? (
        <>
          <input type="file" accept="video/*" onChange={handleFileChange} />
          <input
            type="text"
            placeholder={`Título (${activeLang})`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
          />
          <input
            type="text"
            placeholder={`Descripción (${activeLang})`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploading}
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !videoFile}
          >
            {uploading ? "Subiendo..." : "Subir Video"}
          </button>
        </>
      ) : uploading ? (
        <>
          <div className="video-file-card uploading">
            <FaFileVideo className="file-icon" />
            <span className="file-name" title={title}>
              {title}
            </span>
            <FaCheckCircle className="check-icon" />
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        </>
      ) : (
        <div className="nested-section uploaded-summary">
          <div className="video-summary-text">
            🎥 <strong>{title}</strong>
            <p className="video-description">
              {description || "Sin descripción"}
            </p>
          </div>
          <button
            type="button"
            className="delete-button"
            onClick={handleDelete}
          >
            <FaTrashAlt />
          </button>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default UploadVideoField;
