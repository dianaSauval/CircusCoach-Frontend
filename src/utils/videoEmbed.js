// utils/videoEmbed.js
export const getVideoEmbedUrl = (url) => {
  if (typeof url !== "string") return null;

  // Vimeo (normal o player)
  if (url.includes("vimeo.com")) {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    const id = match?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }

  // YouTube normal
  if (url.includes("youtube.com/watch")) {
    const match = url.match(/[?&]v=([^&]+)/);
    const id = match?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  // YouTube short links
  if (url.includes("youtu.be")) {
    const id = url.split("/").pop();
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  return null; // No se pudo parsear
};
