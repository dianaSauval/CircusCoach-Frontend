import { useState, useEffect } from "react";
import api from "../../../services/api";
import "./ClassList.css";
import { FaTrashAlt } from "react-icons/fa";

const ClassList = ({
  module,
  setSelectedClass,
  selectedClass,
  onDeleteClass,
}) => {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, [module]);

  const fetchClasses = async () => {
    try {
      const response = await api.get(`/classes/module/${module._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setClasses(response.data);
    } catch (error) {
      console.error("Error al obtener clases:", error);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (onDeleteClass) {
      onDeleteClass(classId); // usa la función que vino desde arriba
    }
  };

  return (
    <div className="class-list">
      {classes.length > 0 ? (
        classes.map((cls) => {
          // ✅ Verificamos si `cls.visible` existe y tiene los valores esperados
          const isVisible = cls.visible || {};
          const esVisible = isVisible.es ?? false;
          const enVisible = isVisible.en ?? false;
          const frVisible = isVisible.fr ?? false;

          return (
            <div
              key={cls._id}
              className={`class-item ${
                selectedClass?._id === cls._id ? "selected" : ""
              }`}
            >
              {/* 🔹 Nueva estructura con visibilidad de idiomas */}
              <div className="class-formationContent">
                {/* 🔹 Indicadores de visibilidad */}
                <div className="class-visibilityClass">
                  <>
                    <span className={esVisible ? "visible" : "not-visible"}>
                      Español {esVisible ? "✅" : "✖"}
                    </span>
                    <span className={enVisible ? "visible" : "not-visible"}>
                      Inglés {enVisible ? "✅" : "✖"}
                    </span>
                    <span className={frVisible ? "visible" : "not-visible"}>
                      Francés {frVisible ? "✅" : "✖"}
                    </span>
                  </>
                </div>

                {/* 🔹 Nombre de la clase */}
                <div className="class-header">
                  <div className="class-header">
                    <span
                      className={`titulo-principal class-title ${
                        selectedClass?._id === cls._id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedClass(cls)}
                    >
                      {cls.title?.es || "Sin título"}
                    </span>
                  </div>
                </div>

                {/* 🔹 Botón de eliminar */}
                <div className="class-actions">
                  <button
                     className="boton-eliminar delete-btn"
                    onClick={() => onDeleteClass(cls)} // Pasás el objeto clase completo
                  >
                     <FaTrashAlt /> Eliminar Clase
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="no-classes">No hay clases en este módulo.</p>
      )}
    </div>
  );
};

export default ClassList;
