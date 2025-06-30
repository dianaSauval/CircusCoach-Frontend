import { useEffect, useState } from "react";
import { checkVimeoAvailability } from "../../../utils/vimeoStatus";
import { getYoutubeEmbedUrl } from "../../../utils/youtube";

const isVimeoUrl = (url) => url?.includes("vimeo.com");
const isYoutubeUrl = (url) => url?.includes("youtube.com") || url?.includes("youtu.be");

const VideoEmbedPreview = ({ videoUrl }) => {
  const [estadoVimeo, setEstadoVimeo] = useState("ready"); // 'ready' | 'processing' | 'error'

  useEffect(() => {
    const verificarVimeo = async () => {
      if (isVimeoUrl(videoUrl)) {
        const match = videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        const videoId = match?.[1];
        if (videoId) {
          const estado = await checkVimeoAvailability(videoId);
          setEstadoVimeo(estado);
        }
      }
    };

    verificarVimeo();
  }, [videoUrl]);

if (!videoUrl || videoUrl.trim() === "") {
  return null; // No mostrar nada si está vacío (ya hay otros elementos en la card)
}


  if (isYoutubeUrl(videoUrl)) {
    return (
      <div className="video-container">
        <iframe
          width="100%"
          height="250"
          src={getYoutubeEmbedUrl(videoUrl)}
          title="Video de presentación"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    );
  }

  if (isVimeoUrl(videoUrl)) {
    if (estadoVimeo === "processing") {
      return <p style={{ color: "#999", fontStyle: "italic" }}>⏳ El video está siendo procesado por Vimeo. Pronto estará disponible.</p>;
    }
    if (estadoVimeo === "error") {
      return <p style={{ color: "crimson", fontStyle: "italic" }}>❌ Hubo un error al cargar el video desde Vimeo. Intentalo más tarde.</p>;
    }
    return (
      <div className="video-container">
        <iframe
          width="100%"
          height="250"
          src={videoUrl.replace("vimeo.com/", "player.vimeo.com/video/")}
          title="Video de presentación"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return <p style={{ color: "darkorange", fontStyle: "italic" }}>⚠️ El formato del video no es compatible.</p>;
};

export default VideoEmbedPreview;
