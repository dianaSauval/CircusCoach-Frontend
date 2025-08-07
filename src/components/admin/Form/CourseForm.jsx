import { useEffect, useRef, useState } from "react";
import "./CourseForm.css";
import { eliminarVideoDeVimeo } from "../../../services/uploadVimeoService";
import { eliminarArchivoDesdeFrontend } from "../../../services/uploadCloudinary";
import VideoPromocionalForm from "../../common/VideoPromocionalForm/VideoPromocionalForm";
import CourseClassForm from "./CourseClassForm";
import UploadPdfPublicoField from "../../common/UploadPdfPublicoField/UploadPdfPublicoField";
import UploadImagenField from "../../common/UploadImagenField/UploadImagenField";
import validateCourseForm from "../../../utils/validations/validateCourseForm";

const CourseForm = ({ initialData, isClass, onCancel, onSave, activeTab }) => {
  // Los hooks van siempre arriba
  const [formData, setFormData] = useState(() => {
    const baseClassData = {
      subtitle: { es: "", en: "", fr: "" },
      content: { es: "", en: "", fr: "" },
      secondaryContent: { es: "", en: "", fr: "" },
      pdfs: [],
      videos: [],
      imagen: null,
    };

    const baseCourseData = {
      title: { es: "", en: "", fr: "" },
      description: { es: "", en: "", fr: "" },
      price: 0,
      image: { es: "", en: "", fr: "" },
      pdf: { es: "", en: "", fr: "" },
      public_id_pdf: { es: "", en: "", fr: "" },
      video: { es: "", en: "", fr: "" },
    };

    return {
      ...(isClass ? baseClassData : baseCourseData),
      ...initialData, // pisa valores si ya existían
    };
  });
  const [errors, setErrors] = useState({});
  const [tempUploads, setTempUploads] = useState({
    pdfs: [],
    pdfsAEliminar: [],
    videos: [],
    videosAEliminar: [],
  });
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const priceRef = useRef(null);

  // Inicializar campos por si vienen incompletos
  useEffect(() => {
    if (isClass && initialData?.videos?.length > 0) {
      setFormData((prev) => {
        const ids = initialData.videos.map((v) => v._id);
        return {
          ...prev,
          videos: initialData.videos,
          videoIds: ids,
        };
      });
    }
  }, [isClass, initialData]);

  const handleCancel = async () => {
    // ✅ Eliminar solo los videos NUEVOS (no los marcados para eliminar)
    for (let url of tempUploads.videos) {
      try {
        await eliminarVideoDeVimeo(url);
      } catch (err) {
        console.error("Error al eliminar video temporal:", err);
      }
    }

    // ✅ NO eliminar los de videosAEliminar. Solo se eliminan al guardar.

    // ✅ Eliminar PDFs nuevos
    for (let public_id of tempUploads.pdfs) {
      try {
        await eliminarArchivoDesdeFrontend(public_id, "raw");
      } catch (err) {
        console.error("Error al eliminar PDF temporal:", err);
      }
    }

    // ✅ Eliminar imagen nueva (si hay)

    if (tempUploads.imagenNueva) {
      try {
        await eliminarArchivoDesdeFrontend(tempUploads.imagenNueva, "image");
        console.log("🗑️ Imagen nueva eliminada:", tempUploads.imagenNueva);
      } catch (err) {
        console.warn("⚠️ No se pudo eliminar imagen nueva:", err.message);
      }
    }

    // ❌ NO eliminar imagenAEliminar (es una imagen existente)
    // Solo se elimina si se guarda

    // ✅ Limpiar estado por si se vuelve a editar luego
    setTempUploads({
      pdfs: [],
      videos: [],
      videosAEliminar: [],
      imagenNueva: null,
      imagenAEliminar: null,
    });

    // ✅ Cancelar edición
    onCancel();
  };

  // 👉 Si es una clase, usamos el componente aparte
  if (isClass) {
    return (
      <>
        <CourseClassForm
          formData={formData}
          setFormData={setFormData}
          initialData={initialData}
          activeTab={activeTab}
          onCancel={handleCancel}
          tempUploads={tempUploads}
          setTempUploads={setTempUploads}
          onSave={() =>
            onSave({
              ...prepareDataForSave(formData), // ✅ mismo cleaning que en cursos
              tempUploads, // ✅ agregás tempUploads correctamente
            })
          }

          // ✅ asegurás que se pase el `formData` que llega desde adentro
        />
      </>
    );
  }

  const prepareDataForSave = (data) => {
    return {
      title: data.title,
      visible: data.visible,
      description: data.description?.es
        ? data.description
        : { es: data.description || "", en: "", fr: "" },
      image: {
        es: data.image?.es || "",
        en: data.image?.en || "",
        fr: data.image?.fr || "",
      },

      price: Number(data.price),
      pdf: {
        es:
          typeof data.pdf?.es === "object" && data.pdf?.es !== null
            ? data.pdf.es.url
            : data.pdf?.es || "",
        en:
          typeof data.pdf?.en === "object" && data.pdf?.en !== null
            ? data.pdf.en.url
            : data.pdf?.en || "",
        fr:
          typeof data.pdf?.fr === "object" && data.pdf?.fr !== null
            ? data.pdf.fr.url
            : data.pdf?.fr || "",
      },

      public_id_pdf: {
        es: data.public_id_pdf?.es || "",
        en: data.public_id_pdf?.en || "",
        fr: data.public_id_pdf?.fr || "",
      },

      video: {
        es: data.video?.es || "",
        en: data.video?.en || "",
        fr: data.video?.fr || "",
      },
    };
  };

  const handleChange = (e, field, lang) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));

    // Limpia el error si existía
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSimpleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpia el error si existía
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateCourseForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.keys(validationErrors)[0];

      const fieldRefMap = {
        title: titleRef,
        description: descriptionRef,
        price: priceRef,
      };

      const ref = fieldRefMap[firstError];
      if (ref && ref.current) {
        ref.current.focus();
      }

      return;
    }

    const cleanedData = prepareDataForSave(formData);
    console.log("📤 Guardando datos:");
    console.log("📝 cleanedData:", cleanedData);
    console.log("🧹 Imagen a eliminar:", tempUploads.imagenAEliminar);

    await onSave({
      ...cleanedData,
      tempUploads, // 🔥 este campo es clave
    });

    // guarda en backend

    // ✅ Después de guardar, eliminamos los videos marcados para borrar
    for (let url of tempUploads.videosAEliminar) {
      try {
        await eliminarVideoDeVimeo(url);
        console.log("🗑️ Video eliminado tras guardar:", url);
      } catch (err) {
        console.error("❌ Error al eliminar video tras guardar:", err);
      }
    }

    // ✅ Después de guardar, eliminamos los PDFs marcados para borrar
    for (let public_id of tempUploads.pdfsAEliminar || []) {
      try {
        await eliminarArchivoDesdeFrontend(public_id, "raw");
        console.log("🗑️ PDF eliminado tras guardar:", public_id);
      } catch (err) {
        console.error("❌ Error al eliminar PDF tras guardar:", err);
      }
    }
  };

  return (
    <form className="course-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <label className="label-formulario">Título:</label>
        <input
          type="text"
          ref={titleRef}
          value={formData.title?.[activeTab] || ""}
          onChange={(e) => handleChange(e, "title", activeTab)}
        />
        {errors.title && <div className="field-error">{errors.title}</div>}
      </div>

      <>
        <div className="form-section">
          <label className="label-formulario">Descripción:</label>
          <textarea
            ref={descriptionRef}
            value={formData.description?.[activeTab] || ""}
            onChange={(e) => handleChange(e, "description", activeTab)}
          />
          {errors.description && (
            <div className="field-error">{errors.description}</div>
          )}
        </div>

        <div className="form-section">
          <label className="label-formulario">Precio:</label>
          <input
            type="number"
            name="price"
            ref={priceRef}
            value={formData.price || ""}
            onChange={handleSimpleChange}
          />
          {errors.price && <div className="field-error">{errors.price}</div>}
        </div>

        <UploadImagenField
          activeLang={activeTab}
          value={formData.image?.[activeTab] || ""}
          onChange={(url) => {
            setFormData((prev) => ({
              ...prev,
              image: { ...prev.image, [activeTab]: url },
            }));
          }}
        />

        {errors.image && <div className="field-error">{errors.image}</div>}

        <div className="form-section">
          <div className="form-section">
            <label className="subtitulo">
              PDF de presentación del curso ({activeTab})
            </label>
            <UploadPdfPublicoField
              activeLang={activeTab}
              pdfUrl={formData.pdf}
              setPdfUrl={(updater) =>
                setFormData((prev) => ({
                  ...prev,
                  pdf:
                    typeof updater === "function" ? updater(prev.pdf) : updater,
                }))
              }
              publicId={formData.public_id_pdf}
              setPublicId={(updater) =>
                setFormData((prev) => ({
                  ...prev,
                  public_id_pdf:
                    typeof updater === "function"
                      ? updater(prev.public_id_pdf)
                      : updater,
                }))
              }
              onTempUpload={(id) =>
                setTempUploads((prev) => ({
                  ...prev,
                  pdfs: [...prev.pdfs, id],
                }))
              }
              onMarkForDeletion={(id) =>
                setTempUploads((prev) => ({
                  ...prev,
                  pdfsAEliminar: [...(prev.pdfsAEliminar || []), id],
                }))
              }
            />
          </div>

          <div className="form-section">
            <VideoPromocionalForm
              formData={formData}
              setFormData={setFormData}
              activeTab={activeTab}
              onAddTempVideo={(url) =>
                setTempUploads((prev) => ({
                  ...prev,
                  videosAEliminar: [...prev.videosAEliminar, url],
                }))
              }
            />
          </div>
        </div>
      </>

      <div className="form-buttons">
        <button className="boton-agregar" type="submit">
          💾 Guardar
        </button>
        <button className="boton-eliminar" onClick={handleCancel}>
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
