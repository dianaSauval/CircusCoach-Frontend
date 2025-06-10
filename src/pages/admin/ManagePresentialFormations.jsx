// pages/admin/ManagePresentialFormations.jsx
import { useEffect, useState } from "react";
import {
  getPresentialFormations,
  deletePresentialFormation,
  updatePresentialFormation,
  
} from "../../services/presentialService";
import PresentialFormationForm from "../../components/admin/Form/PresentialFormationForm";
import AddPresentialFormationModal from "../../components/admin/ModalAdmin/AddPresentialFormationModal";

import "../../styles/admin/ManagePresentialFormations.css";

const ManagePresentialFormations = () => {
  const [formations, setFormations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("es");

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

  const handleDelete = async (id) => {
    if (confirm("¿Seguro que querés eliminar esta formación?")) {
      try {
        await deletePresentialFormation(id);
        if (selected?._id === id) setSelected(null);
        fetchFormations();
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
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
          <h2>📌 Formaciones disponibles</h2>
          <button className="btn green" onClick={() => setShowAddModal(true)}>
            ➕ Agregar formación
          </button>

          {formations.map((f) => (
            <div
            key={f._id}
            className={`course-card ${selected?._id === f._id ? "selected" : ""}`}
          >
          
              <div className="course-title" onClick={() => setSelected(f)}>
                {f.title?.es}
              </div>
              <div className="course-actions">
                <button className="btn green" onClick={() => handleEdit(f)}>
                  ✏️ Editar
                </button>
                <button className="btn red" onClick={() => handleDelete(f._id)}>
                  🗑 Eliminar
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

                <h2>{selected.title?.[activeTab]}</h2>
                <p>{selected.description?.[activeTab]}</p>
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

                <button className="edit" onClick={() => setIsEditing(true)}>
                  ✏️ Editar
                </button>
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
    </div>
  );
};

export default ManagePresentialFormations;
