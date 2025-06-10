export const getYoutubeEmbedUrl = (url) => {
    const match = url?.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^\s&?]+)/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };
  