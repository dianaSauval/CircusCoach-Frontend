import { useEffect, useMemo, useState } from "react";
import {
  getAllDiscounts,
  deleteDiscount,
  updateDiscount,
} from "../../services/discountService";
import DiscountForm from "../../components/admin/Form/DiscountForm";
import AddDiscountModal from "../../components/admin/ModalAdmin/AddDiscountModal";
import { FaPlus, FaTrash } from "react-icons/fa";

import "../../styles/admin/ManagePresentialFormations.css";
import ConfirmModal from "../../components/common/ConfirmModal";

// Si ya usás LanguageContext en tu proyecto, esto te sirve.
// Si no lo tenés en admin, decime y lo adaptamos a un selector local.
import { useLanguage } from "../../context/LanguageContext";
const getLangTextWithPlaceholder = (
  value,
  lang,
  placeholder = "(aún sin contenido)"
) => {
  if (!value || typeof value !== "object") return placeholder;

  const current = (value?.[lang] || "").trim();
  if (current) return current;

  return placeholder;
};

const getLangText = (value, lang = "es") => {
  // compatibilidad: si viene string, lo devolvemos
  if (typeof value === "string") return value;

  // si viene null/undefined o cualquier cosa rara
  if (!value || typeof value !== "object") return "";

  const pick =
    (value?.[lang] || "").trim() ||
    (value?.es || "").trim() ||
    (value?.en || "").trim() ||
    (value?.fr || "").trim();

  return pick || "";
};

const ManageDiscounts = () => {
  const { language } = useLanguage(); // "es" | "en" | "fr"

  const [discounts, setDiscounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState(null);
  const [activeLangView, setActiveLangView] = useState("es");

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // Si cambias de idioma, refrescamos el panel (solo para re-render limpio)
  useEffect(() => {
    // fuerza re-render natural; no hace falta refetch
  }, [language]);

  const fetchDiscounts = async () => {
    try {
      const data = await getAllDiscounts();
      setDiscounts(data);
    } catch (error) {
      console.error("Error al cargar los bonos:", error);
    }
  };

  const handleDelete = (discount) => {
    setDiscountToDelete(discount);
    setShowConfirmModal(true);
  };

  const handleEdit = (discount) => {
    setSelected(discount);
    setIsEditing(true);
  };

  const handleSave = async (data) => {
    try {
      // OJO: data ya debería venir con {name:{es,en,fr}, description:{...}, targetItems:[{title:{...}}]}
      const updated = await updateDiscount(selected._id, data);

      setIsEditing(false);
      setDiscounts((prev) =>
        prev.map((d) => (d._id === updated._id ? updated : d))
      );
      setSelected(updated);
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  const confirmDeleteDiscount = async () => {
    if (!discountToDelete) return;
    try {
      await deleteDiscount(discountToDelete._id);
      if (selected?._id === discountToDelete._id) setSelected(null);
      await fetchDiscounts();
    } catch (err) {
      console.error("Error al eliminar:", err);
    } finally {
      setShowConfirmModal(false);
      setDiscountToDelete(null);
    }
  };

  const deleteName = useMemo(
    () => getLangText(discountToDelete?.name, language),
    [discountToDelete, language]
  );

  return (
    <div className="manage-courses-container">
      <h1 className="main-title">🎁 Bonos de Descuento</h1>

      <div className="courses-layout">
        <div className="courses-list">
          <h2 className="titulo-principal">Bonos creados</h2>

          <button
            className="boton-agregar agregar-bono"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Crear nuevo bono
          </button>

          {discounts.map((d) => {
            const name = getLangText(d?.name, language) || "— (sin nombre)";
            return (
              <div
                key={d._id}
                className={`course-card ${
                  selected?._id === d._id ? "selected" : ""
                }`}
              >
                <div
                  className="titulo-principal course-title"
                  onClick={() => {
                    setSelected(d);
                    setIsEditing(false);
                    setActiveLangView("es");
                  }}
                >
                  {name}
                </div>

                <div className="course-actions">
                  <button
                    className="boton-agregar editar"
                    onClick={() => handleEdit(d)}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    className="boton-eliminar"
                    onClick={() => handleDelete(d)}
                  >
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {selected && (
          <div className="course-edit-panel">
            {isEditing ? (
              <DiscountForm
                initialData={selected}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="informationCoursePresential">
                {/* Tabs idiomas (vista) */}
                <div className="language-tabs">
                  {["es", "en", "fr"].map((l) => (
                    <button
                      key={l}
                      type="button"
                      className={activeLangView === l ? "active" : ""}
                      onClick={() => setActiveLangView(l)}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Título / descripción en el idioma elegido */}
                <h2 className="titulo-principal">
                  {getLangTextWithPlaceholder(
                    selected?.name,
                    activeLangView,
                    "(aún sin título)"
                  )}
                </h2>

                <p className="texto">
                  {getLangTextWithPlaceholder(
                    selected?.description,
                    activeLangView,
                    "(aún sin descripción)"
                  )}
                </p>

                <div className="informationPresential">
                  <p>
                    <strong>Tipo:</strong>{" "}
                    {selected.type === "course"
                      ? "Cursos"
                      : selected.type === "formation"
                      ? "Formaciones"
                      : "Ambos"}
                  </p>

                  <p>
                    <strong>Descuento:</strong>{" "}
                    {selected.percentage > 0
                      ? `${selected.percentage}%`
                      : selected.amount > 0
                      ? `€${selected.amount}`
                      : "Sin descuento"}
                  </p>

                  <p>
                    <strong>Válido desde:</strong>{" "}
                    {selected.startDate
                      ? new Date(selected.startDate).toLocaleDateString()
                      : "—"}
                  </p>

                  <p>
                    <strong>Hasta:</strong>{" "}
                    {selected.endDate
                      ? new Date(selected.endDate).toLocaleDateString()
                      : "—"}
                  </p>

                  <p>
                    <strong>Estado:</strong>{" "}
                    {selected.active ? "Activo ✅" : "Inactivo ⛔️"}
                  </p>

                  <div className="aplica-row">
                    <strong className="aplica-label">Aplica a:</strong>

                    <div className="aplica-tags">
                      {Array.isArray(selected.targetItems) &&
                      selected.targetItems.length > 0 ? (
                        selected.targetItems.map((item) => {
                          const t = getLangTextWithPlaceholder(
                            item?.title,
                            activeLangView,
                            "(sin título en este idioma)"
                          );

                          return (
                            <span
                              key={item._id}
                              className="aplica-tag"
                              title={t}
                            >
                              {t}
                            </span>
                          );
                        })
                      ) : (
                        <span className="aplica-empty">Ninguno</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddDiscountModal
          onClose={() => setShowAddModal(false)}
          onAdded={(newDiscount) => {
            setDiscounts((prev) => [...prev, newDiscount]);
            setSelected(newDiscount);
            setIsEditing(false);
          }}
        />
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDeleteDiscount}
        title="¿Eliminar bono?"
        message={`¿Estás segura/o de eliminar el bono "${
          deleteName || "—"
        }"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default ManageDiscounts;
