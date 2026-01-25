import { useEffect, useState } from "react";
import {
  getAllPhysicalProducts,
  deletePhysicalProduct,
  updatePhysicalProduct,
} from "../../services/physicalProductService";
import { useLanguage } from "../../context/LanguageContext";

import PhysicalProductForm from "../../components/admin/Form/PhysicalProductForm";
import AddPhysicalProductModal from "../../components/admin/ModalAdmin/AddPhysicalProductModal";

import { FaPlus, FaTrash } from "react-icons/fa";
import "../../styles/admin/ManagePresentialFormations.css"; // mismo layout que Bonos
import "../../styles/admin/ManagePhysicalProducts.css";
import ConfirmModal from "../../components/common/ConfirmModal";

const ManagePhysicalProducts = () => {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [activeLangView, setActiveLangView] = useState("es");

  const pickLangFrom = (field, lang) =>
    field?.[lang] || field?.es || field?.en || field?.fr || "";

  const { language } = useLanguage();

  const pickLang = (field) =>
    field?.[language] || field?.es || field?.en || field?.fr || "";

  const hasLangValue = (field, lang) => Boolean(field?.[lang]?.trim());

  const langLabel = (l) =>
    l === "es" ? "español" : l === "en" ? "inglés" : "francés";

  const titleInLang = selected
    ? (selected.title?.[activeLangView] || "").trim()
    : "";
  const descInLang = selected
    ? (selected.description?.[activeLangView] || "").trim()
    : "";

  const titleFallback = selected ? pickLang(selected.title) : ""; // lo dejamos solo para ALT, si querés
  const showTitle = Boolean(titleInLang); // ✅ solo mostramos si existe en el idioma activo

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getAllPhysicalProducts(); // público, devuelve todos
      setProducts(data);
    } catch (error) {
      console.error("Error al cargar productos físicos:", error);
    }
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowConfirmModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await deletePhysicalProduct(productToDelete._id); // admin
      if (selected?._id === productToDelete._id) setSelected(null);
      await fetchProducts();
    } catch (err) {
      console.error("Error al eliminar producto:", err);
    } finally {
      setShowConfirmModal(false);
      setProductToDelete(null);
    }
  };

  const handleEdit = (product) => {
    setSelected(product);
    setIsEditing(true);
  };

  const handleSave = async (data) => {
    try {
      const updated = await updatePhysicalProduct(selected._id, data); // admin
      setIsEditing(false);

      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p)),
      );
      setSelected(updated);
    } catch (err) {
      console.error("Error al guardar producto:", err);
    }
  };

  return (
    <div className="manage-courses-container">
      <h1 className="main-title">🛍️ Productos Físicos</h1>

      <div className="courses-layout">
        {/* LISTA IZQUIERDA */}
        <div className="courses-list">
          <h2 className="titulo-principal">Productos cargados</h2>

          <button
            className="boton-agregar agregar-bono"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Crear nuevo producto
          </button>

          {products.map((p) => (
            <div
              key={p._id}
              className={`course-card ${
                selected?._id === p._id ? "selected" : ""
              }`}
            >
              <div
                className="titulo-principal course-title"
                onClick={() => {
                  setSelected(p);
                  setActiveLangView("es");
                }}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                }}
              >
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={pickLang(p.title)}
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
                  {pickLang(p.title)}
                </span>
              </div>

              <div
                className="informationPresential"
                style={{ gap: 6, marginBottom: 0 }}
              >
                <p style={{ margin: 0 }}>
                  <strong>Stock:</strong>{" "}
                  {p.stock === 0 ? "Agotado ⛔️" : `${p.stock} ✅`}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Precio:</strong> €{Number(p.priceEur || 0).toFixed(2)}
                </p>
              </div>

              <div className="course-actions">
                <button
                  className="boton-agregar editar"
                  onClick={() => handleEdit(p)}
                >
                  ✏️ Editar
                </button>
                <button
                  className="boton-eliminar"
                  onClick={() => handleDelete(p)}
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
              <PhysicalProductForm
                initialData={selected}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="mpp-preview">
                {/* Tabs idiomas (vista) */}
                <div className="mpp-tabs">
                  {["es", "en", "fr"].map((l) => (
                    <button
                      key={l}
                      type="button"
                      className={`mpp-tab ${activeLangView === l ? "active" : ""}`}
                      onClick={() => setActiveLangView(l)}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* ✅ TÍTULO */}
                {showTitle ? (
                  <h2 className="titulo-principal physical-preview-title">
                    {titleInLang}
                  </h2>
                ) : (
                  <div className="mpp-pill">
                    ⚠️ Título aún no cargado en {langLabel(activeLangView)}
                  </div>
                )}

                {/* ✅ IMAGEN */}
                {selected.imageUrl && (
                  <div className="mpp-preview-imageWrap">
                    <img
                      src={selected.imageUrl}
                      alt={titleFallback || "Producto"}
                      className="mpp-preview-image"
                    />
                  </div>
                )}

                {/* ✅ DESCRIPCIÓN */}
                {descInLang ? (
                  <p className="texto mpp-preview-desc">{descInLang}</p>
                ) : (
                  <div className="mpp-pill">
                    ⚠️ Descripción no cargada en {langLabel(activeLangView)}
                  </div>
                )}

                {/* ✅ INFO */}
                <div className="informationPresential physical-preview-info">
                  <p>
                    <strong>Precio:</strong> €
                    {Number(selected.priceEur || 0).toFixed(2)}
                  </p>
                  <p>
                    <strong>Stock:</strong>{" "}
                    {selected.stock === 0
                      ? "Agotado ⛔️"
                      : `${selected.stock} ✅`}
                  </p>
                  <p>
                    <strong>Link Amazon:</strong>{" "}
                    <a
                      href={selected.amazonUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mpp-link"
                    >
                      Ver en Amazon
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL CREAR */}
      {showAddModal && (
        <AddPhysicalProductModal
          onClose={() => setShowAddModal(false)}
          onAdded={(newProduct) => setProducts((prev) => [...prev, newProduct])}
        />
      )}

      {/* CONFIRM DELETE */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDeleteProduct}
        title="¿Eliminar producto?"
        message={`¿Estás segura/o de eliminar "${pickLang(
          productToDelete?.title,
        )}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default ManagePhysicalProducts;
