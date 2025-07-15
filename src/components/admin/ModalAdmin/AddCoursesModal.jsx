import { useRef, useState } from "react";
import "./AddItemModal.css";
import AddCourseForm from "./addFormModal/AddCourseForm";
import AddCourseClassForm from "./addFormModal/AddCourseClassForm";
import {
  createCourse,
  createCourseClass,
} from "../../../services/courseService";
import { eliminarArchivoDesdeFrontend } from "../../../services/uploadCloudinary";
import validateCourseClassForm from "../../../utils/validations/validateCourseClassForm";
import validateCourseForm from "../../../utils/validations/validateCourseForm";
import { eliminarVideoDeVimeo } from "../../../services/uploadVimeoService";

const AddCoursesModal = ({
  courseId,
  onClose,
  onCourseAdded,
  onClassAdded,
}) => {
  const isAddingCourse = !courseId;
  const [activeTab, setActiveTab] = useState("es");
  const [errors, setErrors] = useState({});

  const [formDataCourse, setFormDataCourse] = useState({
    title: { es: "", en: "", fr: "" },
    description: { es: "", en: "", fr: "" },
    price: "",
    image: { es: "", en: "", fr: "" },
    image_public_id: { es: "", en: "", fr: "" },
    pdf: { es: "", en: "", fr: "" },
    public_id_pdf: { es: "", en: "", fr: "" },
    video: { es: "", en: "", fr: "" },
    visible: { es: true, en: false, fr: false },
  });

  const [formDataClass, setFormDataClass] = useState({
    es: { pdfs: [], videos: [] },
    en: { pdfs: [], videos: [] },
    fr: { pdfs: [], videos: [] },
    title: { es: "", en: "", fr: "" },
    subtitle: { es: "", en: "", fr: "" },
    content: { es: "", en: "", fr: "" },
    secondaryContent: { es: "", en: "", fr: "" },
    visible: { es: false, en: false, fr: false },
  });

  const [tempPdfPublicIds, setTempPdfPublicIds] = useState([]);
  const [tempVideoUrls, setTempVideoUrls] = useState([]);
  const [imagePublicIds, setImagePublicIds] = useState([]);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null); // para curso
  const contentRef = useRef(null);

  const inputClass = (field) => (errors[field] ? "input error" : "input");

  const handleSubmit = async () => {
    const data = isAddingCourse ? formDataCourse : formDataClass;
    const validate = isAddingCourse
      ? validateCourseForm
      : validateCourseClassForm;
    const validationErrors = validate(data);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // 🔎 Mapear el campo con error al ref
      const firstError = Object.keys(validationErrors)[0];
      const refMap = isAddingCourse
        ? { title: titleRef, description: descriptionRef }
        : { title: titleRef, content: contentRef };

      const ref = refMap[firstError];
      if (ref && ref.current) {
        ref.current.focus();
        ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      return;
    }

    try {
      if (isAddingCourse) {
        const transformedData = {
          ...formDataCourse,
          pdf: {
            es: formDataCourse.pdf.es?.url || "",
            en: formDataCourse.pdf.en?.url || "",
            fr: formDataCourse.pdf.fr?.url || "",
          },
        };

        const nuevoCurso = await createCourse(transformedData);
        onCourseAdded?.(nuevoCurso);
      } else {
        // reconstruir pdfs/videos como ya hacías
        const pdfs = [];
        const videos = [];
        ["es", "en", "fr"].forEach((lang) => {
          // PDF
          formDataClass[lang]?.pdfs?.forEach((pdf) => {
            let obj = pdfs.find((p) => p._id === pdf._id);
            if (!obj) {
              obj = { _id: pdf._id, url: {}, title: {}, description: {} };
              pdfs.push(obj);
            }
            obj.url[lang] = pdf.url?.[lang] || "";
            obj.title[lang] = pdf.title?.[lang] || "";
            obj.description[lang] = pdf.description?.[lang] || "";
          });

          // Videos
          formDataClass[lang]?.videos?.forEach((video) => {
            let obj = videos.find((v) => v._id === video._id);
            if (!obj) {
              obj = { _id: video._id, url: {}, title: {}, description: {} };
              videos.push(obj);
            }
            obj.url[lang] = video.url?.[lang] || "";
            obj.title[lang] = video.title?.[lang] || "";
            obj.description[lang] = video.description?.[lang] || "";
          });
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
      }

      onClose();
    } catch (error) {
      console.error("❌ Error al crear:", error);
      setErrors({
        global: error.response?.data?.error || "Error inesperado.",
      });
    }
  };

  const handleCancel = async () => {
    try {
      // 🧹 Eliminar PDFs temporales (Cloudinary)
      for (const id of tempPdfPublicIds) {
        await eliminarArchivoDesdeFrontend(id, "raw");
        console.log("🗑️ PDF eliminado:", id);
      }

      // 🧹 Eliminar imágenes temporales (Cloudinary)
      for (const id of imagePublicIds) {
        await eliminarArchivoDesdeFrontend(id, "image");
        console.log("🗑️ Imagen eliminada:", id);
      }

      // 🧹 Eliminar videos temporales (Vimeo)
      for (const url of tempVideoUrls) {
        await eliminarVideoDeVimeo(url);
        console.log("🗑️ Video eliminado de Vimeo:", url);
      }
    } catch (err) {
      console.warn("⚠️ Error durante limpieza:", err.message);
    } finally {
      onClose(); // Cerrar el modal sí o sí
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isAddingCourse ? "Agregar Curso" : "Agregar Clase"}</h2>
        {errors.global && (
          <div className="mensaje-error-global">{errors.global}</div>
        )}

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
            titleRef={titleRef}
            descriptionRef={descriptionRef}
            activeTab={activeTab}
            formData={formDataCourse}
            setFormData={setFormDataCourse}
            errors={errors}
            setErrors={setErrors}
            inputClass={inputClass}
            onTempPdf={(id) => setTempPdfPublicIds((prev) => [...prev, id])}
            onTempVideo={(url) => setTempVideoUrls((prev) => [...prev, url])}
            onTempImage={(id) => setImagePublicIds((prev) => [...prev, id])}
          />
        ) : (
          <AddCourseClassForm
            titleRef={titleRef}
            contentRef={contentRef}
            activeTab={activeTab}
            formData={formDataClass}
            setFormData={setFormDataClass}
            errors={errors}
            setErrors={setErrors}
            onTempPdf={(id) => setTempPdfPublicIds((prev) => [...prev, id])}
            onTempVideo={(url) => setTempVideoUrls((prev) => [...prev, url])}
          />
        )}

        <div className="content-button-modal">
          <button className="boton-agregar" onClick={handleSubmit}>
            ✅ {isAddingCourse ? "Crear Curso" : "Crear Clase"}
          </button>
          <button className="boton-eliminar" onClick={handleCancel}>
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCoursesModal;
