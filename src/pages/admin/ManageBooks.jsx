import { useEffect, useState } from "react";
import {
  getAllBooksAdmin,
  deleteBook,
  updateBook,
  setBookVisibility,
  getBookFile,
} from "../../services/bookService";

import { FaPlus, FaTrash } from "react-icons/fa";
import "../../styles/admin/ManagePresentialFormations.css";
import ConfirmModal from "../../components/common/ConfirmModal";
import AddBookModal from "../../components/admin/ModalAdmin/AddBookModal";
import BookForm from "../../components/admin/Form/BookForm";

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await getAllBooksAdmin();
      setBooks(data);
    } catch (error) {
      console.error("Error al cargar libros:", error);
    }
  };

  const handleDelete = (book) => {
    setBookToDelete(book);
    setShowConfirmModal(true);
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;

    try {
      await deleteBook(bookToDelete._id, true);
      if (selected?._id === bookToDelete._id) setSelected(null);
      await fetchBooks();
    } catch (err) {
      console.error("Error al eliminar libro:", err);
    } finally {
      setShowConfirmModal(false);
      setBookToDelete(null);
    }
  };

  const handleEdit = (book) => {
    setSelected(book);
    setIsEditing(true);
  };

  const handleToggleVisible = async (book) => {
    try {
      const updated = await setBookVisibility(book._id, !book.visible);

      setBooks((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b)),
      );

      if (selected?._id === updated._id) setSelected(updated);
    } catch (err) {
      console.error("Error al cambiar visibilidad:", err);
    }
  };

  const handleGetPdf = async (book) => {
    try {
      const data = await getBookFile(book._id); // { url, downloadable, viewOnline }
      if (data?.url) window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Error al abrir PDF:", err);
    }
  };

  const handleSave = async (data) => {
    try {
      const updated = await updateBook(selected._id, data);
      setIsEditing(false);

      setBooks((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b)),
      );
      setSelected(updated);
    } catch (err) {
      console.error("Error al guardar libro:", err);
    }
  };

  const renderTitle = (t) =>
    typeof t === "object"
      ? t?.es || t?.en || t?.fr || "Sin título"
      : t || "Sin título";

  return (
    <div className="manage-courses-container">
      <h1 className="main-title">📚 Libros</h1>

      <div className="courses-layout">
        {/* LISTA IZQUIERDA */}
        <div className="courses-list">
          <h2 className="titulo-principal">Libros cargados</h2>

          <button
            className="boton-agregar agregar-bono"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Crear nuevo libro
          </button>

          {books.map((b) => (
            <div
              key={b._id}
              className={`course-card ${
                selected?._id === b._id ? "selected" : ""
              }`}
            >
              <div
                className="titulo-principal course-title"
                onClick={() => {
                  setSelected(b);
                  setIsEditing(false);
                }}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                }}
              >
                {b.coverImage?.url && (
                  <img
                    src={b.coverImage.url}
                    alt={b.title}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      objectFit: "cover",
                      border: "1px solid #ddd",
                      flexShrink: 0,
                    }}
                  />
                )}

                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {typeof b.title === "object"
                    ? b.title?.es || b.title?.en || b.title?.fr || "Sin título"
                    : b.title || "Sin título"}
                </span>
              </div>

              <div
                className="informationPresential"
                style={{ gap: 6, marginBottom: 0 }}
              >
                <p style={{ margin: 0 }}>
                  <strong>Visible:</strong> {b.visible ? "Sí ✅" : "No ⛔️"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Precio:</strong> {b.currency || "EUR"}{" "}
                  {Number(b.price || 0).toFixed(2)}
                </p>
              </div>

              <div className="course-actions">
                <button
                  className="boton-agregar editar"
                  onClick={() => handleEdit(b)}
                >
                  ✏️ Editar
                </button>

                <button
                  className="boton-agregar editar"
                  onClick={() => handleToggleVisible(b)}
                >
                  👁️ {b.visible ? "Ocultar" : "Mostrar"}
                </button>

                <button
                  className="boton-eliminar"
                  onClick={() => handleDelete(b)}
                >
                  <FaTrash /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PANEL DERECHO */}
        {selected && (
          <div className="course-edit-panel">
            {isEditing ? (
              <BookForm
                initialData={selected}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="informationCoursePresential">
                {/* ✅ Título (así no vuelve a pasar que “no se ve”) */}
                <h2 className="titulo-principal" style={{ marginBottom: 10 }}>
                  {typeof selected.title === "object"
                    ? selected.title?.es ||
                      selected.title?.en ||
                      selected.title?.fr ||
                      "Sin título"
                    : selected.title || "Sin título"}
                </h2>

                {/* Preview descripción */}
                {selected.description && (
                  <p className="texto">
                    {typeof selected.description === "object"
                      ? selected.description?.es ||
                        selected.description?.en ||
                        selected.description?.fr ||
                        ""
                      : selected.description}
                  </p>
                )}

                {/* Preview portada */}
                {selected.coverImage?.url ? (
                  <div
                    style={{
                      margin: "14px 0",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={selected.coverImage.url}
                      alt={
                        typeof selected.title === "object"
                          ? selected.title?.es ||
                            selected.title?.en ||
                            selected.title?.fr ||
                            "Portada"
                          : selected.title || "Portada"
                      }
                      style={{
                        width: "100%",
                        maxWidth: 420,
                        borderRadius: 12,
                        border: "1px solid rgba(20, 50, 81, 0.18)",
                        display: "block",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ) : (
                  <div className="book-cover-empty">
                    🖼️ Aún no se ha cargado ninguna imagen de portada.
                  </div>
                )}

                {/* Datos del libro */}
                <div className="informationPresential">
                  <p>
                    <strong>Slug:</strong> {selected.slug || "-"}
                  </p>

                  <p>
                    <strong>Idioma:</strong>{" "}
                    {selected.language?.toUpperCase?.() || "-"}
                  </p>

                  <p>
                    <strong>Precio:</strong> {selected.currency || "EUR"}{" "}
                    {Number(selected.price || 0).toFixed(2)}
                  </p>

                  <p>
                    <strong>Visible:</strong>{" "}
                    {selected.visible ? "Sí ✅" : "No ⛔️"}
                  </p>

                  <p>
                    <strong>PDF:</strong>{" "}
                    {selected.pdf?.url || selected.pdf?.public_id
                      ? "Cargado ✅"
                      : "No cargado ⛔️"}
                  </p>
                </div>

                {/* ✅ Preview PDF (como en el form) */}
                <div className="book-pdf-block" style={{ marginTop: 12 }}>
                  <div className="book-pdf-header">
                    <strong>📄 PDF</strong>

                    {selected.pdf?.url ? (
                      <button
                        className="book-pdf-btn"
                        onClick={() =>
                          window.open(
                            selected.pdf.url,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                      >
                        Abrir
                      </button>
                    ) : (
                      <span className="book-pdf-empty">No cargado</span>
                    )}
                  </div>

                  {selected.pdf?.url ? (
                    <div className="book-pdf-preview">
                      <iframe
                        src={`${selected.pdf.url}#toolbar=0&navpanes=0&scrollbar=1`}
                        title={`PDF - ${typeof selected.title === "string" ? selected.title : "Libro"}`}
                      />
                    </div>
                  ) : (
                    <p className="book-pdf-empty-text">No cargado ⛔️</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL CREAR */}
      {showAddModal && (
        <AddBookModal
          onClose={() => setShowAddModal(false)}
          onAdded={(newBook) => setBooks((prev) => [...prev, newBook])}
        />
      )}

      {/* CONFIRM DELETE */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDeleteBook}
        title="¿Eliminar libro?"
        message={`¿Estás segura/o de eliminar "${
          typeof bookToDelete?.title === "object"
            ? bookToDelete?.title?.es ||
              bookToDelete?.title?.en ||
              bookToDelete?.title?.fr ||
              "este libro"
            : bookToDelete?.title || "este libro"
        }"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default ManageBooks;
