// pages/admin/ManagePresentialFormations.jsx
import { useEffect, useState } from "react";
import {
  getPresentialFormations,
  deletePresentialFormation,
  updatePresentialFormation,
} from "../../services/presentialService";
import PresentialFormationForm from "../../components/admin/Form/PresentialFormationForm";
import AddPresentialFormationModal from "../../components/admin/ModalAdmin/AddPresentialFormationModal";
import ConfirmModal from "../../components/common/ConfirmModal"
import "../../styles/admin/ManagePresentialFormations.css";
import { FaPlus, FaTrash } from "react-icons/fa";

const ManagePresentialFormations = () => {
  const [formations, setFormations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("es");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState(null);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const data = await getPresentialFormations();
      setFormations(data);
    } catch (error) {
      console.error("Error al cargar formaciones:", error);
    }
  };

  const openDeleteModal = (formation) => {
    setFormationToDelete(formation);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setFormationToDelete(null);
  };

  const confirmDelete = async () => {
    if (!formationToDelete) return;

    try {
      await deletePresentialFormation(formationToDelete._id);

      // Si la formación eliminada es la que está seleccionada, la limpiamos
      if (selected?._id === formationToDelete._id) {
        setSelected(null);
        setIsEditing(false);
      }

      // Actualizamos la lista en memoria sin necesidad de refetch si querés
      setFormations((prev) =>
        prev.filter((f) => f._id !== formationToDelete._id)
      );
    } catch (err) {
      console.error("Error al eliminar:", err);
    } finally {
      closeDeleteModal();
    }
  };

  const handleEdit = (formation) => {
    setSelected(formation);
    setIsEditing(true);
  };
  const handleSave = async (data) => {
    try {
      const updated = await updatePresentialFormation(selected._id, data);

      setIsEditing(false);

      // ✅ Actualizamos en memoria tanto la lista como la formación seleccionada
      setFormations((prev) =>
        prev.map((f) => (f._id === updated._id ? updated : f))
      );
      setSelected(updated); // <--- clave para refrescar el panel derecho
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  

  return (
    <div className="manage-courses-container">
      <h1 className="main-title">🏫 Formaciones Presenciales</h1>

      <div className="courses-layout">
        <div className="courses-list">
          <h2 className="titulo-principal">Formaciones presenciales</h2>
          <button
            className="boton-agregar"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Agregar formación
          </button>

          {formations.map((f) => (
            <div
              key={f._id}
              className={`course-card ${
                selected?._id === f._id ? "selected" : ""
              }`}
            >
              <div
                className="titulo-principal course-title"
                onClick={() => setSelected(f)}
              >
                {f.title?.es}
              </div>
              <div className="course-actions">
                <button
                  className="boton-agregar editar"
                  onClick={() => handleEdit(f)}
                >
                  ✏️ Editar
                </button>
                <button
                  className="boton-eliminar"
                  onClick={() => openDeleteModal(f)}
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
              <PresentialFormationForm
                initialData={selected}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            ) : (
              <div className="informationCoursePresential">
                {/* Viñetas de idioma en modo visualización */}
                <div className="language-tabs">
                  {["es", "en", "fr"].map((lang) => (
                    <button
                      key={lang}
                      className={activeTab === lang ? "active" : ""}
                      onClick={() => setActiveTab(lang)}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>

                <h2 className="titulo-principal">
                  {selected.title?.[activeTab]}
                </h2>
                <p className="texto">{selected.description?.[activeTab]}</p>
                <div className="informationPresential">
                  <p>
                    <strong>Ubicación:</strong> {selected.location?.[activeTab]}
                  </p>
                  <p>
                    <strong>Horario:</strong> {selected.time}
                  </p>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {selected.dateType === "single"
                      ? new Date(selected.singleDate).toLocaleDateString()
                      : `${new Date(
                          selected.dateRange?.start
                        ).toLocaleDateString()} - ${new Date(
                          selected.dateRange?.end
                        ).toLocaleDateString()}`}
                  </p>
                  <p>
                    <strong>Link de inscripción:</strong>{" "}
                    {selected.registrationLink}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddPresentialFormationModal
          onClose={() => setShowAddModal(false)}
          onAdded={(newFormation) => {
            setFormations((prev) => [...prev, newFormation]);
          }}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          title="¿Eliminar formación presencial?"
          message={
            formationToDelete
              ? `Estás por eliminar "${
                  formationToDelete.title?.es || "esta formación"
                }". Esta acción no se puede deshacer.`
              : "Esta acción no se puede deshacer."
          }
        />
      )}
    </div>
  );
};

export default ManagePresentialFormations;
