// src/utils/cartItemView.js

export const getCartItemTitle = (item, language = "es") => {
  if (!item) return "";

  // 📚 Book: title es string
  if (item.type === "book") {
    return (item.title || "").trim();
  }

  // 🎪 Course / Formation: title es objeto multi-idioma
  const t = item.title;
  if (t && typeof t === "object") {
    return (
      (t[language] || "").trim() ||
      (t.es || "").trim() ||
      (t.en || "").trim() ||
      (t.fr || "").trim() ||
      ""
    );
  }

  // fallback si viniera string por error
  return (t || "").trim();
};

export const getCartItemImage = (item, language = "es") => {
  if (!item) return "/placeholder.png";

  // 📚 Book: image es string (url)
  if (item.type === "book") {
    return item.image || "/img/placeholder-book.jpg";
  }

  // 🎪 Course / Formation: image es objeto multi-idioma
  const img = item.image;
  if (img && typeof img === "object") {
    return (
      img[language] ||
      img.es ||
      img.en ||
      img.fr ||
      "/placeholder.png"
    );
  }

  // fallback si viniera string por error
  return img || "/placeholder.png";
};

export const getCartItemId = (item) => item?.id || item?._id || "";
