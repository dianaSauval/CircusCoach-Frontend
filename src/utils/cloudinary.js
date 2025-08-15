// utils/cloudinary.js
export function getImagePublicIdFromUrl(url) {
  if (!url) return "";
  const m = url.match(/\/upload\/(?:v\d+\/)?([^.]*)\.(?:jpg|jpeg|png|webp|gif|bmp|tiff|svg)/i);
  // m[1] = "carpeta/subcarpeta/nombre_archivo"
  return m?.[1] || "";
}
