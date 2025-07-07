import { useState, useEffect } from "react";
import "../../styles/admin/ManageFormations.css";
import ModuleList from "../../components/admin/ModuleList/ModuleList";
import EditPanel from "../../components/admin/EditPanel/EditPanel";
import AddItemModal from "../../components/admin/ModalAdmin/AddItemModal";
import {
  deleteClassById,
  deleteFormation,
  deleteModule,
  getAllFormations,
} from "../../services/formationService";
import ConfirmModal from "../../components/common/ConfirmModal";
import { FaTrashAlt } from "react-icons/fa";

const ManageFormations = () => {
  const [formations, setFormations] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [expandedFormations, setExpandedFormations] = useState({});
  const [showModal, setShowModal] = useState(null);
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState(null);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [classToDelete, setClassToDelete] = useState(null);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const data = await getAllFormations();
      setFormations(data);
    } catch (error) {
      console.error("Error al cargar formaciones:", error);
    }
  };

  const toggleExpandFormation = (formationId) => {
    setExpandedFormations((prev) => ({
      ...prev,
      [formationId]: !prev[formationId],
    }));
  };

  const handleSelectModule = (module) => {
    console.log("Seleccionando módulo:", module.title.es);
    setSelectedModule(module);
    setSelectedFormation(null);
    setSelectedClass(null);
  };

  const handleSelectClass = (classItem) => {
    if (classItem) {
      console.log(
        "Seleccionando clase:",
        classItem?.title?.es || "Clase sin título"
      );
      setSelectedClass(classItem);
      setSelectedModule(null);
    }
  };

  const confirmDeleteFormation = async () => {
    try {
      await deleteFormation(formationToDelete._id);
      setFormationToDelete(null);
      fetchFormations();
    } catch (error) {
      console.error("Error al eliminar formación:", error);
    }
  };

  const confirmDeleteModule = async () => {
    try {
      await deleteModule(moduleToDelete._id);
      setModuleToDelete(null);
      fetchFormations(); // o fetchModules si solo querés refrescar esa parte
    } catch (error) {
      console.error("Error al eliminar módulo:", error);
    }
  };

  const handleDeleteClass = (classItem) => {
    setClassToDelete(classItem);
  };

  const confirmDeleteClass = async () => {
    try {
      await deleteClassById(classToDelete._id);
      setClassToDelete(null);
      fetchFormations(); // O podés hacer un fetch más localizado si querés optimizar
    } catch (error) {
      console.error("Error al eliminar clase:", error);
    }
  };

  return (
    <div className="manage-formations-container">
      <h1>📚 Formaciones</h1>

      <div
        className={`formations-layout ${isListCollapsed ? "collapsed" : ""}`}
      >
        <button
          className={`collapse-toggle ${
            isListCollapsed ? "collapsed-position" : ""
          }`}
          onClick={() => setIsListCollapsed(!isListCollapsed)}
          title={
            isListCollapsed
              ? "Expandir panel lateral"
              : "Colapsar panel lateral"
          }
        >
          {isListCollapsed ? "🡢" : "🡠"}
        </button>
        <div
          className={`formations-list ${isListCollapsed ? "collapsed" : ""}`}
        >
          {!isListCollapsed && (
            <>
              <h2 className="titulo-principal">Formaciones</h2>
              <button
                className="boton-agregar add-formation"
                onClick={() =>
                  setShowModal({ type: "formation", parentId: null })
                }
              >
                ➕ Crear nueva formación
              </button>

              {formations.map((formation) => {
                const { es, en, fr } = formation.visible;

                return (
                  <div key={formation._id} className="formation-item">
                    <div className="formation-content">
                      <div className="formation-visibility">
                        <span className={es ? "visible" : "not-visible"}>
                          Español {es ? "✅" : " ❌"}
                        </span>
                        <span className={en ? "visible" : "not-visible"}>
                          Inglés {en ? "✅" : " ❌"}
                        </span>
                        <span className={fr ? "visible" : "not-visible"}>
                          Francés {fr ? "✅" : " ❌"}
                        </span>
                      </div>

                      <div className="formation-header">
                        <span
                          className={`titulo-principal formationEdit-title ${
                            selectedFormation?._id === formation._id
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedFormation(formation);
                            setSelectedModule(null);
                            setSelectedClass(null);
                          }}
                        >
                          {formation.title.es}
                        </span>
                        <button
                          className="toggle-btn"
                          onClick={() => toggleExpandFormation(formation._id)}
                        >
                          {expandedFormations[formation._id] ? "⬆️" : "⬇️"}
                        </button>
                      </div>

                      <div className="formation-actions">
                        <button
                          className="boton-agregar small-btn"
                          onClick={() =>
                            setShowModal({
                              type: "module",
                              parentId: formation._id,
                            })
                          }
                        >
                          ➕ Agregar módulo
                        </button>
                        <button
                          className="boton-eliminar delete-formation"
                          onClick={() => setFormationToDelete(formation)}
                        >
                            <FaTrashAlt /> Eliminar Formación
                        </button>
                      </div>
                    </div>

                    {expandedFormations[formation._id] && (
                      <div className="formation-modules">
                        <ModuleList
                          formation={formation}
                          setSelectedModule={handleSelectModule}
                          setSelectedClass={handleSelectClass}
                          selectedModule={selectedModule}
                          selectedClass={selectedClass}
                          setShowModalInParent={setShowModal}
                          setModuleToDelete={setModuleToDelete}
                          onDeleteClass={handleDeleteClass}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <EditPanel
          selectedFormation={selectedFormation}
          selectedModule={selectedModule}
          selectedClass={selectedClass}
          onUpdate={fetchFormations}
        />
      </div>

      {showModal && (
        <AddItemModal
          type={showModal.type}
          parentId={showModal.parentId}
          closeModal={() => setShowModal(null)}
          onAdd={fetchFormations}
        />
      )}
      {formationToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setFormationToDelete(null)}
          onConfirm={confirmDeleteFormation}
          title="¿Eliminar formación?"
          message={`Estás por eliminar la formación: "${formationToDelete.title.es}". Esta acción no se puede deshacer.`}
        />
      )}

      {moduleToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setModuleToDelete(null)}
          onConfirm={confirmDeleteModule}
          title="¿Eliminar módulo?"
          message={`Estás por eliminar el módulo: "${moduleToDelete.title.es}". Esta acción no se puede deshacer.`}
        />
      )}

      {classToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setClassToDelete(null)}
          onConfirm={confirmDeleteClass}
          title="¿Eliminar clase?"
          message={`Estás por eliminar la clase: "${
            classToDelete.title?.es || "Sin título"
          }". Esta acción no se puede deshacer.`}
        />
      )}
    </div>
  );
};

export default ManageFormations;
