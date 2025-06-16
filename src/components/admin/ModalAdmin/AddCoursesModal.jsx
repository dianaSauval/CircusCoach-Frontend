import { useState } from "react";
import "./AddItemModal.css";
import AddCourseForm from "./addFormModal/AddCourseForm";
import AddCourseClassForm from "./addFormModal/AddCourseClassForm";
import { createCourseClass } from "../../../services/courseService";
import { eliminarArchivoDesdeFrontend } from "../../../services/uploadCloudinary";

const AddCoursesModal = ({
  courseId,
  onClose,
  onClassAdded,
  onCourseAdded,
}) => {
  const isAddingCourse = !courseId;
  const [activeTab, setActiveTab] = useState("es");
  const [errors, setErrors] = useState({});

  // 👉 Para CURSOS
  const [formDataCourse, setFormDataCourse] = useState({
    title: { es: "", en: "", fr: "" },
    description: { es: "", en: "", fr: "" },
    price: "",
    image: { es: "", en: "", fr: "" },
    pdf: { es: "", en: "", fr: "" },
    public_id_pdf: { es: "", en: "", fr: "" },
    video: { es: "", en: "", fr: "" },
    visible: { es: true, en: false, fr: false },
  });

  // 👉 Para CLASES
const [formDataClass, setFormDataClass] = useState({
  es: { pdfs: [], videos: [] },
  en: { pdfs: [], videos: [] },
  fr: { pdfs: [], videos: [] },
  title: { es: "", en: "", fr: "" },
  subtitle: { es: "", en: "", fr: "" },
  content: { es: "", en: "", fr: "" },
  secondaryContent: { es: "", en: "", fr: "" },
  visible: { es: true, en: false, fr: false },
});


  const handleChangeCourse = (e) => {
    const { name, value } = e.target;
    setFormDataCourse((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [activeTab]: value,
      },
    }));
  };

  const inputClass = (fieldName) =>
    errors[fieldName] ? "input error" : "input";

  const handleCreateClass = async () => {
  if (!formDataClass.title?.[activeTab]) {
    setErrors({ title: "El título en español es obligatorio." });
    return;
  }

  try {
    // Extraer los arrays multilenguaje correctamente
    const pdfs = [];
    const videos = [];

    ["es", "en", "fr"].forEach((lang) => {
      if (formDataClass[lang]?.pdfs?.length) {
        formDataClass[lang].pdfs.forEach((pdf) => {
          // Buscamos si ya existe un pdf con ese _id
          let existing = pdfs.find((p) => p._id === pdf._id);
          if (!existing) {
            existing = {
              _id: pdf._id,
              url: { es: "", en: "", fr: "" },
              title: { es: "", en: "", fr: "" },
              description: { es: "", en: "", fr: "" },
            };
            pdfs.push(existing);
          }

          existing.url[lang] = pdf.url?.[lang] || "";
          existing.title[lang] = pdf.title?.[lang] || "";
          existing.description[lang] = pdf.description?.[lang] || "";
        });
      }

      if (formDataClass[lang]?.videos?.length) {
        formDataClass[lang].videos.forEach((video) => {
          let existing = videos.find((v) => v._id === video._id);
          if (!existing) {
            existing = {
              _id: video._id,
              url: { es: "", en: "", fr: "" },
              title: { es: "", en: "", fr: "" },
              description: { es: "", en: "", fr: "" },
            };
            videos.push(existing);
          }

          existing.url[lang] = video.url?.[lang] || "";
          existing.title[lang] = video.title?.[lang] || "";
          existing.description[lang] = video.description?.[lang] || "";
        });
      }
    });

    const payload = {
      title: formDataClass.title,
      subtitle: formDataClass.subtitle,
      content: formDataClass.content,
      secondaryContent: formDataClass.secondaryContent,
      visible: formDataClass.visible,
      pdfs,
      videos,
      course: courseId,
    };

    const nuevaClase = await createCourseClass(courseId, payload);
    onClassAdded?.(nuevaClase);
    onClose();
  } catch (error) {
    console.error("❌ Error al crear la clase:", error);
    setErrors({
      global:
        error.response?.data?.error || "Error inesperado al crear la clase.",
    });
  }
};


const handleClose = () => {
  if (!isAddingCourse && formDataClass.pdfs?.length > 0) {
    formDataClass.pdfs.forEach((pdf) => {
      ["es", "en", "fr"].forEach((lang) => {
        const publicId = pdf?.public_id?.[lang];
        if (publicId) {
          eliminarArchivoDesdeFrontend(publicId);
        }
      });
    });
  }

  onClose();
};



  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isAddingCourse ? "Agregar Curso" : "Agregar Clase"}</h2>

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

        {isAddingCourse ? (
          <AddCourseForm
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSubmitSuccess={onCourseAdded}
            onClose={onClose}
            setErrors={setErrors}
            errors={errors}
            formData={formDataCourse}
            setFormData={setFormDataCourse}
            handleChange={handleChangeCourse}
            inputClass={inputClass}
          />
        ) : (
          <AddCourseClassForm
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            courseId={courseId}
            onClose={handleClose}
            errors={errors}
            setErrors={setErrors}
            formData={formDataClass}
            setFormData={setFormDataClass}
            onSubmit={handleCreateClass}
          />
        )}
      </div>
    </div>
  );
};

export default AddCoursesModal;
