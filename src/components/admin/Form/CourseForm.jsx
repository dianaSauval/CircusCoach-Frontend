import { useEffect, useRef, useState } from "react";
import "./CourseForm.css";
import { eliminarVideoDeVimeo } from "../../../services/uploadVimeoService";
import { eliminarArchivoDesdeFrontend } from "../../../services/uploadCloudinary";
import VideoPromocionalForm from "../../common/VideoPromocionalForm/VideoPromocionalForm";
import CourseClassForm from "./CourseClassForm";
import UploadPdfPublicoField from "../../common/UploadPdfPublicoField/UploadPdfPublicoField";
import UploadImagenField from "../../common/UploadImagenField/UploadImagenField";
import validateCourseForm from "../../../utils/validations/validateCourseForm";

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

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
      image_public_id: { es: "", en: "", fr: "" },
      pdf: { es: "", en: "", fr: "" },
      public_id_pdf: { es: "", en: "", fr: "" },
      video: { es: "", en: "", fr: "" },
    };

    // 👇 deep clone del initialData
    const safeInitial = deepClone(initialData || {});

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
    imagenNueva: null,
    imagenAEliminar: null,
  });
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const priceRef = useRef(null);

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

  useEffect(() => {
    if (isClass && Array.isArray(initialData?.videos)) {
      setFormData((prev) => ({
        ...prev,
        videos: deepClone(initialData.videos),
        videoIds: initialData.videos.map((v) => v._id),
        // si querés ser consistente, también podés clonar pdfs aquí
        pdfs: Array.isArray(initialData?.pdfs)
          ? deepClone(initialData.pdfs)
          : [],
      }));
    }
  }, [isClass, initialData]);

  const handleCancel = async (e) => {
    e?.preventDefault?.();

    // 🎥 Borrar videos NUEVOS subidos en esta edición
    for (const url of tempUploads.videos || []) {
      try {
        await eliminarVideoDeVimeo(url);
      } catch {
        console.log("error");
      }
    }

    // 📄 Borrar PDFs PRIVADOS NUEVOS subidos en esta edición (Cloudinary raw)
    for (const public_id of tempUploads.pdfs || []) {
      try {
        await eliminarArchivoDesdeFrontend(public_id, "raw");
      } catch {
        console.log("error");
      }
    }

    // 🔄 Restaurar SOLO curso (PDF público / imagen pública) – ya lo tenías
    setFormData((prev) => ({
      ...prev,
      pdf: { ...prev.pdf, [activeTab]: initialData?.pdf?.[activeTab] || "" },
      public_id_pdf: {
        ...prev.public_id_pdf,
        [activeTab]: initialData?.public_id_pdf?.[activeTab] || "",
      },
      image: {
        ...prev.image,
        [activeTab]: initialData?.image?.[activeTab] || "",
      },
      image_public_id: {
        ...prev.image_public_id,
        [activeTab]: initialData?.image_public_id?.[activeTab] || "",
      },
    }));

    // 🔄 Si estás editando una CLASE: rehidratar arrays desde la data original
    if (isClass) {
      setFormData((prev) => ({
        ...prev,
        // 👇 importantísimo: restaurar a cómo vino del backend
        pdfs: Array.isArray(initialData?.pdfs)
          ? deepClone(initialData.pdfs)
          : [],
        videos: Array.isArray(initialData?.videos)
          ? deepClone(initialData.videos)
          : [],
      }));
    }

    // 🧹 Limpiar buffers
    setTempUploads({
      pdfs: [],
      pdfsAEliminar: [],
      videos: [],
      videosAEliminar: [],
      imagenNueva: null,
      imagenAEliminar: null,
    });

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
          onSave={(fd) => {
            const payloadClase = {
              // campos de CLASE
              title: fd.title,
              subtitle: fd.subtitle,
              content: fd.content,
              secondaryContent: fd.secondaryContent,
              visible: fd.visible,
              pdfs: Array.isArray(fd.pdfs) ? fd.pdfs : [],
              videos: Array.isArray(fd.videos) ? fd.videos : [],
              tempUploads, // para que el panel (CourseEditPanel) borre en Cloudinary/Vimeo tras guardar
            };
            onSave(payloadClase);
          }}
        />
      </>
    );
  }

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

    // ✅ Después de guardar, eliminamos las imágenes marcadas para borrar
    if (tempUploads.imagenAEliminar) {
      try {
        await eliminarArchivoDesdeFrontend(
          tempUploads.imagenAEliminar,
          "image"
        );
        console.log(
          "🗑️ Imagen eliminada tras guardar:",
          tempUploads.imagenAEliminar
        );
      } catch (err) {
        console.error("❌ Error al eliminar imagen tras guardar:", err);
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
          publicIdActual={formData.image_public_id?.[activeTab] || ""} // 👈 nuevo
          onChange={(url, publicId) => {
            // Subí una NUEVA imagen => queda "temporal" hasta guardar
            setFormData((prev) => ({
              ...prev,
              image: { ...prev.image, [activeTab]: url },
              image_public_id: {
                ...prev.image_public_id,
                [activeTab]: publicId,
              },
            }));
            setTempUploads((prev) => ({ ...prev, imagenNueva: publicId })); // para borrar si se cancela
          }}
          // Si el usuario toca "Eliminar" en una imagen PERSISTIDA
          onMarkForDeletion={(publicId) => {
            setTempUploads((prev) => ({ ...prev, imagenAEliminar: publicId }));
            // Vaciamos visualmente para que prepareDataForSave mande string vacío
            setFormData((prev) => ({
              ...prev,
              image: { ...prev.image, [activeTab]: "" },
              image_public_id: { ...prev.image_public_id, [activeTab]: "" },
            }));
          }}
          // Si el usuario toca "Eliminar" en una imagen NUEVA (temporal)
          onDeleteTempNow={async (publicId) => {
            try {
              await eliminarArchivoDesdeFrontend(publicId, "image");
              setTempUploads((prev) => ({ ...prev, imagenNueva: null }));
              setFormData((prev) => ({
                ...prev,
                image: { ...prev.image, [activeTab]: "" },
                image_public_id: { ...prev.image_public_id, [activeTab]: "" },
              }));
            } catch (e) {
              console.error("Error borrando imagen temporal:", e);
            }
          }}
          isTempPublicId={(id) => id && id === tempUploads.imagenNueva}
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
                  // guardo par {lang, public_id} por si lo necesito
                  pdfsAEliminar: [
                    ...(prev.pdfsAEliminar || []),
                    { lang: activeTab, public_id: id },
                  ],
                }))
              }
              isTempPublicId={(id) =>
                Array.isArray(tempUploads.pdfs) && tempUploads.pdfs.includes(id)
              }
              onDeleteTempNow={async (id) => {
                try {
                  await eliminarArchivoDesdeFrontend(id, "raw");
                  // sacar del listado de temps para que Cancel no reprocesé
                  setTempUploads((prev) => ({
                    ...prev,
                    pdfs: prev.pdfs.filter((x) => x !== id),
                  }));
                  // limpiar UI
                  setFormData((prev) => ({
                    ...prev,
                    pdf: { ...prev.pdf, [activeTab]: "" },
                    public_id_pdf: { ...prev.public_id_pdf, [activeTab]: "" },
                  }));
                } catch (e) {
                  console.error("Error borrando PDF temporal:", e);
                }
              }}
            />
          </div>

          <div className="form-section">
            <VideoPromocionalForm
              formData={formData}
              setFormData={setFormData}
              activeTab={activeTab}
              onTempUpload={(url) =>
                setTempUploads((prev) => ({
                  ...prev,
                  videos: [...prev.videos, url], // 👈 NUEVO: track TEMP
                }))
              }
              onMarkForDeletion={(url) =>
                setTempUploads((prev) => ({
                  ...prev,
                  videosAEliminar: [...prev.videosAEliminar, url], // 👈 EXISTENTE → borrar al Guardar
                }))
              }
              isTempVideoUrl={(url) =>
                Array.isArray(tempUploads.videos) &&
                tempUploads.videos.includes(url)
              }
              onDeleteTempNow={async (url) => {
                try {
                  await eliminarVideoDeVimeo(url); // 🔥 borrar YA si es TEMP
                  setTempUploads((prev) => ({
                    ...prev,
                    videos: prev.videos.filter((v) => v !== url),
                  }));
                  setFormData((prev) => ({
                    ...prev,
                    video: { ...(prev?.video || {}), [activeTab]: "" },
                  }));
                } catch (e) {
                  console.error("Error borrando video temporal:", e);
                }
              }}
            />
          </div>
        </div>
      </>

      <div className="form-buttons">
        <button className="boton-agregar" type="submit">
          💾 Guardar
        </button>
        <button type="button" className="boton-eliminar" onClick={handleCancel}>
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
