import { useState, useEffect } from "react";
import "../../styles/admin/ManageCourses.css";
import CourseEditPanel from "../../components/admin/CourseEditPanel/CourseEditPanel";
import CourseClassList from "../../components/admin/CourseClassList/CourseClassList";
import AddCoursesModal from "../../components/admin/ModalAdmin/AddCoursesModal";
import {
  deleteCourse,
  deleteCourseClass,
  getAllCourses,
} from "../../services/courseService";
import ConfirmModal from "../../components/common/ConfirmModal";
import { FaTrashAlt } from "react-icons/fa";

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalCourseId, setModalCourseId] = useState(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
    }
  };

  const toggleExpandCourse = (courseId) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setSelectedClass(null);
  };

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
  };

  const handleCourseOrClassUpdated = () => {
    fetchCourses();
  };
  const handleDeleteCourse = (courseId) => {
    setCourseToDelete(courseId);
    setConfirmModalOpen(true);
  };

  const handleOpenModal = (courseId) => {
    setModalCourseId(courseId);
    setIsAddingCourse(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setModalCourseId(null);
    setShowModal(false);
  };

  const handleClassAdded = (newClass) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course._id === newClass.course
          ? { ...course, classes: [...(course.classes || []), newClass] }
          : course
      )
    );

    if (selectedCourse?._id === newClass.course) {
      setSelectedCourse((prev) => ({
        ...prev,
        classes: [...(prev.classes || []), newClass],
      }));
    }
  };

  const handleCourseAdded = (newCourse) => {
    setCourses((prev) => [...prev, newCourse]);
  };

  const handleOpenAddCourseModal = () => {
    setModalCourseId(null);
    setIsAddingCourse(true);
    setShowModal(true);
  };

  const handleDeleteClass = async (cls) => {
    try {
      await deleteCourseClass(cls._id);
      console.log("✅ Clase eliminada:", cls._id);
      handleCourseOrClassUpdated();
      if (selectedClass?._id === cls._id) setSelectedClass(null);
    } catch (error) {
      console.error("❌ Error al eliminar clase:", error);
    }
  };

  return (
    <div className="manage-courses-container">
      <h1 className="main-title">📘 Cursos</h1>

      <div className={`courses-layout ${isCollapsed ? "collapsed" : ""}`}>
        <div className={`courses-list ${isCollapsed ? "collapsed" : ""}`}>
          <button
            className={`collapse-toggleCourses ${
              isCollapsed ? "collapsed" : "expanded"
            }`}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? "🡢" : "🡠"}
          </button>
          {!isCollapsed && (
            <>
              <h2 className="titulo-principal">Cursos disponibles</h2>
              <button className="boton-agregar btn green" onClick={handleOpenAddCourseModal}>
                ➕ Agregar curso
              </button>

              {courses.map((course) => (
                <div key={course._id} className="course-card">
                  <div className="visibility-row">
                    {["es", "en", "fr"].map((lang) => (
                      <span key={lang} className="lang-visibility">
                        {lang === "es" && "Español"}
                        {lang === "en" && "Inglés"}
                        {lang === "fr" && "Francés"}{" "}
                        {course.visible?.[lang] ? "✅" : "❌"}
                      </span>
                    ))}
                  </div>

                  <div
                    className={`titulo-principal course-title ${
                      selectedCourse?._id === course._id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectCourse(course)}
                  >
                    {course.title?.es || "Sin título"}
                  </div>

                  <div className="course-actions">
                    <button
                      className="boton-agregar"
                      onClick={() => handleOpenModal(course._id)}
                    >
                      ➕ Agregar clase
                    </button>
                    <button
                      className="boton-eliminar"
                      onClick={() => handleDeleteCourse(course._id)}
                    >
                      <FaTrashAlt /> Eliminar Curso
                    </button>
                    <button
                      className="btn icon"
                      onClick={() => toggleExpandCourse(course._id)}
                      title="Ver clases"
                    >
                      {expandedCourses[course._id] ? "⬆️" : "⬇️"}
                    </button>
                  </div>

                  {expandedCourses[course._id] && (
                    <CourseClassList
                      course={course}
                      selectedClass={selectedClass}
                      setSelectedClass={handleSelectClass}
                      onClassDeleted={handleCourseOrClassUpdated}
                      onDeleteClass={handleDeleteClass}
                    />
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        <CourseEditPanel
          course={selectedCourse}
          selectedClass={selectedClass}
          onUpdate={handleCourseOrClassUpdated}
        />
      </div>

      {showModal && (
        <AddCoursesModal
          courseId={modalCourseId}
          isAddingCourse={isAddingCourse}
          onClose={handleCloseModal}
          onClassAdded={handleClassAdded}
          onCourseAdded={handleCourseAdded}
        />
      )}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          console.log("CANCELAR MODAL");
          setConfirmModalOpen(false);
          setCourseToDelete(null);
        }}
        onConfirm={async () => {
          try {
            await deleteCourse(courseToDelete);
            if (selectedCourse?._id === courseToDelete) setSelectedCourse(null);
            fetchCourses();
          } catch (error) {
            console.error("Error al eliminar curso:", error);
          } finally {
            setConfirmModalOpen(false);
            setCourseToDelete(null);
          }
        }}
        title="Eliminar curso"
        message="¿Estás segura/o de que querés eliminar este curso? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default ManageCourses;
