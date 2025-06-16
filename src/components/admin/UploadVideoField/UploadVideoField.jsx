import { useState } from "react";
import "./UploadVideoField.css";
import { subirVideoAVimeo } from "../../../services/uploadVimeoService";
import { FaTrashAlt, FaCheckCircle, FaFileVideo } from "react-icons/fa";

const UploadVideoField = ({ activeLang = "es", onUploadSuccess }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleted, setDeleted] = useState(false);

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
      const rawUrl = await subirVideoAVimeo(
        videoFile,
        title,
        description,
        (progress) => {
          const p = Math.round(progress);
          setUploadProgress(p);
        }
      );

      setUploadProgress(100);
      const publicUrl = rawUrl.replace("/videos/", "/");

      const videoObj = {
        url: publicUrl,
        title,
        description,
      };

      setVideoUrl(publicUrl);
      setDeleted(false);
      onUploadSuccess?.(videoObj);
      setVideoFile(null);
    } catch (err) {
      console.error("❌ Error subiendo video:", err);
      setError("Error al subir el video. Intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-video-field">
      {!videoUrl ? (
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
        <div className="video-file-card uploading">
          <FaFileVideo className="file-icon" />
          <span className="file-name" title={title}>
            {title}
          </span>
          <FaCheckCircle className="check-icon" />
        </div>
      ) : null}

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

export default UploadVideoField;
