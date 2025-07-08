import { useState, useEffect } from "react";
import {
  subirVideoPromocional,
  eliminarVideoDeVimeo,
} from "../../../services/uploadVimeoService";
import { FaArrowLeft, FaCheckCircle, FaTrashAlt, FaVideo } from "react-icons/fa";
import "./VideoPromocionalForm.css";

const VideoPromocionalForm = ({
  formData = { video: {} },
  setFormData,
  activeTab,
  onAddTempVideo,
}) => {
  const videoUrl = formData?.video?.[activeTab] || "";

  const [uploadModes, setUploadModes] = useState({
    es: null,
    en: null,
    fr: null,
  });
  const uploadMode = uploadModes[activeTab];

  const [videoFile, setVideoFile] = useState(null);
  const [titles, setTitles] = useState({ es: "", en: "", fr: "" });
  const [tempUrls, setTempUrls] = useState({ es: "", en: "", fr: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      const tempVideo = formData?.video?.[activeTab];
      if (tempVideo?.includes("vimeo.com")) {
        onAddTempVideo?.(tempVideo);
      }
    };
  }, []);

  if (typeof setFormData !== "function") {
    return (
      <div className="video-promocional-form">
        <p style={{ color: "red" }}>
          Error interno: la función setFormData no fue pasada correctamente.
        </p>
      </div>
    );
  }

  const setUploadModeForLang = (lang, mode) => {
    setUploadModes((prev) => ({ ...prev, [lang]: mode }));
  };

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitles((prev) => ({ ...prev, [activeTab]: value }));
  };

  const handleTempUrlChange = (e) => {
    const value = e.target.value;
    setTempUrls((prev) => ({ ...prev, [activeTab]: value }));
  };

  const handleUpload = async () => {
    if (!videoFile || !titles[activeTab]) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const publicUrl = await subirVideoPromocional(
        videoFile,
        titles[activeTab],
        "",
        (progress) => setUploadProgress(progress)
      );

      setFormData((prev) => ({
        ...prev,
        video: {
          ...(prev?.video || {}),
          [activeTab]: publicUrl,
        },
      }));

      onAddTempVideo?.(publicUrl);
    } catch (err) {
      console.error("❌ Error al subir video:", err);
      setError("Error al subir el video. Intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleLinkSubmit = () => {
    const url = tempUrls[activeTab];
    if (!url) return;

    setFormData((prev) => ({
      ...prev,
      video: {
        ...(prev?.video || {}),
        [activeTab]: url,
      },
    }));

    onAddTempVideo?.(url);
  };

  const handleRemove = async () => {
    const url = formData?.video?.[activeTab];
    if (!url) return;

    if (url.includes("vimeo.com")) {
      try {
        await eliminarVideoDeVimeo(url);
      } catch (err) {
        console.warn("⚠️ No se pudo eliminar de Vimeo:", err);
      }
    }

    setFormData((prev) => ({
      ...prev,
      video: {
        ...(prev?.video || {}),
        [activeTab]: "",
      },
    }));

    setVideoFile(null);
    setTitles((prev) => ({ ...prev, [activeTab]: "" }));
    setTempUrls((prev) => ({ ...prev, [activeTab]: "" }));
    setUploadModeForLang(activeTab, null);
  };

  return (
    <div className="video-promocional-form">
      <label className="label-formulario">
        🎥 Video de presentación ({activeTab})
      </label>

      {!videoUrl && !uploading && !uploadMode && (
        <div className="video-mode-buttons">
          <button
            className="boton-secundario"
            type="button"
            onClick={() => setUploadModeForLang(activeTab, "file")}
          >
            📤 Subir video
          </button>
          <button
            className="boton-secundario"
            type="button"
            onClick={() => setUploadModeForLang(activeTab, "link")}
          >
            🔗 Pegar enlace
          </button>
        </div>
      )}

      {uploadMode === "file" && !videoUrl && (
        <div className="upload-video-field">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <input
            type="text"
            placeholder={`Título (${activeTab})`}
            value={titles[activeTab] || ""}
            onChange={handleTitleChange}
            disabled={uploading}
          />
          <button
            type="button"
            className="boton-secundario upload"
            onClick={handleUpload}
            disabled={uploading || !videoFile || !titles[activeTab]}
          >
            {uploading ? "Subiendo..." : "Subir Video"}
          </button>
          <button
            type="button"
            className="boton-secundario volver-boton"
            onClick={() => setUploadModeForLang(activeTab, null)}
            disabled={uploading}
          >
            <FaArrowLeft /> Volver
          </button>
        </div>
      )}

      {uploadMode === "link" && !videoUrl && (
        <div className="upload-video-field">
          <input
            type="text"
            placeholder={`Pega aquí el enlace del video (${activeTab})`}
            value={tempUrls[activeTab] || ""}
            onChange={handleTempUrlChange}
          />
          <button
            className="boton-secundario"
            type="button"
            onClick={handleLinkSubmit}
            disabled={!tempUrls[activeTab]}
          >
            Confirmar enlace
          </button>
          <button
            type="button"
            className="boton-secundario volver-boton"
            onClick={() => setUploadModeForLang(activeTab, null)}
            disabled={uploading}
          >
             <FaArrowLeft /> Volver
          </button>
        </div>
      )}

      {uploading && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
            {uploadProgress}%
          </div>
        </div>
      )}

      {videoUrl && !uploading && (
        <div className="video-card">
          <div className="video-card-info">
            <FaVideo className="video-icon" />
            <div className="video-card-info-url">
              <span className="video-title">
                {titles[activeTab] || "Video cargado"}
              </span>

              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="boton-secundario ver-link"
              >
                ▶️ Ver video
              </a>
            </div>
          </div>
          <div className="video-card-actions">
            <button
              type="button"
              className="boton-eliminar btn-eliminar"
              onClick={handleRemove}
            >
              <FaTrashAlt />
            </button>
          </div>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default VideoPromocionalForm;
