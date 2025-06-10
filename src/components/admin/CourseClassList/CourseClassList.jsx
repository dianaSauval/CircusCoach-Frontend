import { deleteCourseClass } from "../../../services/courseService";
import ConfirmModal from "../../common/ConfirmModal";
import "./CourseClassList.css";
import { useEffect, useState } from "react";

const CourseClassList = ({ course, selectedClass, setSelectedClass, onClassDeleted }) => {
  const [localClasses, setLocalClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);

  useEffect(() => {
    setLocalClasses(course.classes || []);
  }, [course]);

  const handleSelect = (cls) => {
    setSelectedClass(cls);
  };

  const requestDelete = (clsId) => {
    setClassToDelete(clsId);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCourseClass(classToDelete);
      setLocalClasses((prev) => prev.filter((cls) => cls._id !== classToDelete));
      if (onClassDeleted) onClassDeleted();
    } catch (error) {
      console.error("Error al eliminar clase:", error);
    } finally {
      setShowModal(false);
      setClassToDelete(null);
    }
  };

  return (
    <div className="course-classes">
      {localClasses.length > 0 ? (
        localClasses.map((cls) => {
          const { es, en, fr } = cls.visible || {};
          return (
            <div
              key={cls._id}
              className={`courseClass-item ${selectedClass?._id === cls._id ? "selected" : ""}`}
            >
              <div className="class-visibilityClass">
                <span className={es ? "visible" : "not-visible"}>Español {es ? "✅" : "❌"}</span>
                <span className={en ? "visible" : "not-visible"}>Inglés {en ? "✅" : "❌"}</span>
                <span className={fr ? "visible" : "not-visible"}>Francés {fr ? "✅" : "❌"}</span>
              </div>

              <span className="class-title" onClick={() => handleSelect(cls)}>
                {cls.title?.es || "Clase sin título"}
              </span>

              <button className="delete-btn" onClick={() => requestDelete(cls._id)}>
                🗑️ Eliminar clase
              </button>
            </div>
          );
        })
      ) : (
        <p className="no-classes">Este curso aún no cuenta con clases.</p>
      )}

      <ConfirmModal
        isOpen={showModal}
        message="¿Seguro que querés eliminar esta clase? Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
};

export default CourseClassList;
