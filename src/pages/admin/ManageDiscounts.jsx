import { useEffect, useState } from "react";
import {
  getAllDiscounts,
  deleteDiscount,
  updateDiscount,
} from "../../services/discountService";
import DiscountForm from "../../components/admin/Form/DiscountForm";
import AddDiscountModal from "../../components/admin/ModalAdmin/AddDiscountModal";
import { FaPlus, FaTrash } from "react-icons/fa";

import "../../styles/admin/ManagePresentialFormations.css"; // Usamos el mismo estilo
import ConfirmModal from "../../components/common/ConfirmModal";

const ManageDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState(null);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const data = await getAllDiscounts();
      setDiscounts(data);
    } catch (error) {
      console.error("Error al cargar los bonos:", error);
    }
  };

  const handleDelete = async (discount) => {
    setDiscountToDelete(discount);
    setShowConfirmModal(true);
  };

  const handleEdit = (discount) => {
    setSelected(discount);
    setIsEditing(true);
  };

  const handleSave = async (data) => {
    try {
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
    fetchDiscounts();
  } catch (err) {
    console.error("Error al eliminar:", err);
  } finally {
    setShowConfirmModal(false);
    setDiscountToDelete(null);
  }
};


  return (
    <div className="manage-courses-container">
      <h1 className="main-title">🎁 Bonos de Descuento</h1>

      <div className="courses-layout">
        <div className="courses-list">
          <h2 className="titulo-principal">Bonos creados</h2>
          <button
            className="boton-agregar"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Crear nuevo bono
          </button>

          {discounts.map((d) => (
            <div
              key={d._id}
              className={`course-card ${
                selected?._id === d._id ? "selected" : ""
              }`}
            >
              <div
                className="titulo-principal course-title"
                onClick={() => setSelected(d)}
              >
                {d.name}
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
          ))}
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
                <h2 className="titulo-principal">{selected.name}</h2>
                <p className="texto">{selected.description}</p>
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
                    {new Date(selected.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Hasta:</strong>{" "}
                    {new Date(selected.endDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    {selected.active ? "Activo ✅" : "Inactivo ⛔️"}
                  </p>
                  <p>
                    <strong>Aplica a:</strong>{" "}
                    {selected.targetItems && selected.targetItems.length > 0
                      ? selected.targetItems.map((item, i) => (
                          <span key={item._id}>
                            {item.title}
                            {i < selected.targetItems.length - 1 ? ", " : ""}
                          </span>
                        ))
                      : "Ninguno"}
                  </p>
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
          }}
        />
      )}
      <ConfirmModal
  isOpen={showConfirmModal}
  onClose={() => setShowConfirmModal(false)}
  onConfirm={confirmDeleteDiscount}
  title="¿Eliminar bono?"
  message={`¿Estás segura/o de eliminar el bono "${discountToDelete?.name}"? Esta acción no se puede deshacer.`}
/>

    </div>
    
  );
};

export default ManageDiscounts;
