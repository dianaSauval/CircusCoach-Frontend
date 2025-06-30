import { useEffect, useState } from "react";
import { obtenerUrlVideoPrivado } from "../../../services/uploadVimeoService";

const VideoPrivadoViewer = ({ classId, index, language }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchVideoUrl = async () => {
      try {
        const url = await obtenerUrlVideoPrivado(classId, index, language);
        if (!cancelled) {
          setVideoUrl(url);
        }
      } catch (err) {
        console.error("❌ Error al obtener video privado:", err);
        if (!cancelled) {
          setError("No se pudo cargar el video");
        }
      }
    };

    fetchVideoUrl();

    return () => {
      cancelled = true;
    };
  }, [classId, index, language]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!videoUrl) return <p>Cargando video...</p>;

  const embedUrl = videoUrl.replace("vimeo.com", "player.vimeo.com/video");

  return (
    <div className="video-embed-container" style={{ marginBottom: "1rem" }}>
      <iframe
        src={embedUrl}
        width="100%"
        height="450"
        frameBorder="0"
        allow="autoplay; fullscreen"
        allowFullScreen
        title={`video-${index}`}
      />
    </div>
  );
};

export default VideoPrivadoViewer;
