import React from "react";
import "./VideoTrainingSchool.css";
import { getYoutubeEmbedUrl } from "../../utils/youtube";

const VideoTrainingSchool = () => {
    const youtubeUrl = "https://www.youtube.com/watch?v=YcVYLo7VSzM"; // tu link normal
    const embedUrl = getYoutubeEmbedUrl(youtubeUrl);

  return (
    <section className="video-portada">
      <div className="video-wrapper">
        <iframe
          src={embedUrl}
          title="Video de portada"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </section>
  );
};

export default VideoTrainingSchool;
