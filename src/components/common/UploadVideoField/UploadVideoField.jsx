import { useState, useEffect } from "react";
import "./UploadVideoField.css";
import { v4 as uuidv4 } from "uuid";
import {
  subirVideoPrivado,
} from "../../../services/uploadVimeoService";
import { FaTrashAlt, FaCheckCircle, FaFileVideo } from "react-icons/fa";

const UploadVideoField = ({
  activeLang = "es",
  videos = [],
  onChange = () => {},
  onTempUpload = () => {},
}) => {
  const [localVideos, setLocalVideos] = useState([]);
  const [addedIds, setAddedIds] = useState([]);

useEffect(() => {
  if (Array.isArray(videos)) {
    const conId = videos.map((v) => ({
      _id: v._id || uuidv4(),
      url: v.url || {},
      title: v.title || {},
      description: v.description || {},
    }));
    setLocalVideos(conId);
  }
}, [videos]);


  const handleUploadSuccess = (videoPartial) => {
    setLocalVideos((prev) => {
      const updated = prev.map((v) =>
        v._id === videoPartial._id
          ? {
              ...v,
              url: { ...v.url, ...videoPartial.url },
              title: { ...v.title, ...videoPartial.title },
              description: { ...v.description, ...videoPartial.description },
            }
          : v
      );
      onChange(updated);
      return updated;
    });
  };

  const handleDiscard = (videoId) => {
    setLocalVideos((prev) => {
      const updated = prev.filter((v) => v._id !== videoId);
      onChange(updated);
      return updated;
    });
  };

 const handleDelete = (videoId) => {
  const video = localVideos.find((v) => v._id === videoId);
  const url = video?.url?.[activeLang];

  if (url) {
    onTempUpload({
      tipo: "eliminar",
      url,
    }); // ⚠️ Guardamos temporalmente para borrar solo si se guarda
  }

  const updated = localVideos.filter((v) => v._id !== videoId);
  setLocalVideos(updated);
  onChange(updated);
};


  const addNewVideo = () => {
    const newId = uuidv4();
    const nuevo = {
      _id: newId,
      url: { [activeLang]: "" },
      title: { [activeLang]: "" },
      description: { [activeLang]: "" },
    };
    const updated = [...localVideos, nuevo];
    setLocalVideos(updated);
    onChange(updated);
    setAddedIds((prev) => [...prev, newId]);
  };

const videosToShow = localVideos.filter((video) => {
  const url = video.url?.[activeLang] || "";
  const title = video.title?.[activeLang] || "";
  const description = video.description?.[activeLang] || "";
  return (
    addedIds.includes(video._id) ||
    url.trim() !== "" ||
    title.trim() !== "" ||
    description.trim() !== ""
  );
});


  return (
    <div className="upload-video-field-multiple">
      {videosToShow.map((video) => (
        <SingleVideoUploader
          key={video._id}
          video={video}
          activeLang={activeLang}
          onUploadSuccess={handleUploadSuccess}
          onDelete={() => handleDelete(video._id)}
          onDiscard={() => handleDiscard(video._id)}
          onTempUpload={onTempUpload}
        />
      ))}

      <button
        type="button"
        className="boton-secundario"
        onClick={addNewVideo}
        style={{ marginTop: 8 }}
      >
        ➕ Agregar Video
      </button>
    </div>
  );
};

export default UploadVideoField;

const SingleVideoUploader = ({
  video,
  activeLang,
  onUploadSuccess,
  onDelete,
  onDiscard = () => {},
}) => {
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");

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

      const videoPartial = {
        _id: video._id,
        url: { [activeLang]: publicUrl },
        title: { [activeLang]: title },
        description: { [activeLang]: description },
      };

      onUploadSuccess(videoPartial);


      setVideoUrl(publicUrl);
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
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              className="boton-agregar upload"
              onClick={handleUpload}
              disabled={uploading || !videoFile}
            >
              {uploading ? "Subiendo..." : "Subir Video"}
            </button>
            <button
              type="button"
              className="boton-eliminar"
              onClick={onDiscard}
            >
              ❌ Quitar
            </button>
          </div>
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
            className="boton-eliminar delete-button"
            onClick={onDelete}
          >
            <FaTrashAlt />
          </button>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};
