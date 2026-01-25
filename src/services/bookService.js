import api from "./api";

// =====================
// 🌍 Público
// =====================

// Listar libros visibles (tienda)
export const getBooks = async () => {
  const res = await api.get("/books");
  return res.data;
};

// Obtener libro por slug
export const getBookBySlug = async (slug) => {
  const res = await api.get(`/books/slug/${slug}`);
  return res.data;
};

// Obtener libro por id (visible)
export const getBookById = async (id) => {
  const res = await api.get(`/books/${id}`);
  return res.data;
};

// =====================
// 🔐 Admin
// =====================

// Listar todos (admin)
export const getAllBooksAdmin = async () => {
  const res = await api.get("/books/admin/all");
  return res.data;
};

// Crear libro
export const createBook = async (bookData) => {
  const res = await api.post("/books", bookData);
  return res.data;
};

// Actualizar libro
export const updateBook = async (id, bookData) => {
  const res = await api.put(`/books/${id}`, bookData);
  return res.data;
};

// Toggle visible
export const setBookVisibility = async (id, visible) => {
  const res = await api.patch(`/books/${id}/visibility`, { visible });
  return res.data;
};

// Eliminar libro
export const deleteBook = async (id, deleteAssets = true) => {
  const res = await api.delete(`/books/${id}`, {
    params: { deleteAssets },
  });
  return res.data;
};


// 📄 Obtener URL del PDF del libro (ver online o descargar)
// 📄 Obtener info del PDF del libro (url + permisos)
export const getBookFile = async (bookId) => {
  try {
    const res = await api.get(`/books/${bookId}/file`);
    // { url, downloadable, viewOnline }
    return res.data;
  } catch (error) {
    console.error("❌ Error al obtener PDF del libro:", error);
    throw new Error("No se pudo obtener el PDF del libro");
  }
};
