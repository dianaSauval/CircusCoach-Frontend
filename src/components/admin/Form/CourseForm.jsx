import { useEffect, useState } from "react";
import "./CourseForm.css";
import { eliminarVideoDeVimeo } from "../../../services/uploadVimeoService";
import { eliminarArchivoDesdeFrontend } from "../../../services/uploadCloudinary";
import VideoPromocionalForm from "../../common/VideoPromocionalForm/VideoPromocionalForm";
import CourseClassForm from "./CourseClassForm";
import UploadPdfPublicoField from "../../common/UploadPdfPublicoField/UploadPdfPublicoField";
import UploadImagenField from "../../common/UploadImagenField/UploadImagenField";

const CourseForm = ({ initialData, isClass, onCancel, onSave, activeTab }) => {
  // Los hooks van siempre arriba
  const [formData, setFormData] = useState(() => {
    const baseClassData = {
      subtitle: { es: "", en: "", fr: "" },
      content: { es: "", en: "", fr: "" },
      secondaryContent: { es: "", en: "", fr: "" },
      pdfs: [],
      videos: [],
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

  const [tempUploads, setTempUploads] = useState({ pdfs: [], videos: [] });

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
    // Eliminar PDFs nuevos
    for (let public_id of tempUploads.pdfs) {
      try {
        await eliminarArchivoDesdeFrontend(public_id, "raw");
      } catch (err) {
        console.error("Error al eliminar PDF temporal:", err);
      }
    }
    // Eliminar Videos nuevos
    for (let url of tempUploads.videos) {
      try {
        await eliminarVideoDeVimeo(url);
      } catch (err) {
        console.error("Error al eliminar video temporal:", err);
      }
    }
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
          onSave={() => onSave({ ...initialData, ...formData })}
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
      image: data.image?.es
        ? data.image
        : { es: data.image || "", en: "", fr: "" },
      price: Number(data.price),
      pdf: {
        es:
          typeof data.pdf?.es === "object"
            ? data.pdf.es.url
            : data.pdf?.es || "",
        en:
          typeof data.pdf?.en === "object"
            ? data.pdf.en.url
            : data.pdf?.en || "",
        fr:
          typeof data.pdf?.fr === "object"
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
  };

  const handleSimpleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = prepareDataForSave(formData);
    onSave(cleanedData);
  };

  return (
    <form className="course-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <label>Título:</label>
        <input
          type="text"
          value={formData.title?.[activeTab] || ""}
          onChange={(e) => handleChange(e, "title", activeTab)}
          required
        />
      </div>

      <>
        <div className="form-section">
          <label>Descripción:</label>
          <textarea
            value={formData.description?.[activeTab] || ""}
            onChange={(e) => handleChange(e, "description", activeTab)}
          />
        </div>

        <div className="form-section">
          <label>Precio:</label>
          <input
            type="number"
            name="price"
            value={formData.price || ""}
            onChange={handleSimpleChange}
          />
        </div>

        <UploadImagenField
          activeLang={activeTab}
          value={formData.image?.[activeTab] || ""}
          onChange={(url) =>
            setFormData((prev) => ({
              ...prev,
              image: { ...prev.image, [activeTab]: url },
            }))
          }
        />

        <div className="form-section">
          <div className="form-section">
            <label>PDF de presentación del curso ({activeTab})</label>
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
            />
          </div>

          <div className="form-section">
            <label style={{ fontWeight: "bold" }}>🎞️ Video promocional:</label>
            <VideoPromocionalForm
              formData={formData}
              setFormData={setFormData}
              activeTab={activeTab}
              onAddTempVideo={(url) =>
                setTempUploads((prev) => ({
                  ...prev,
                  videos: [...prev.videos, url],
                }))
              }
            />
          </div>
        </div>
      </>

      <div className="form-buttons">
        <button type="submit">💾 Guardar</button>
        <button type="button" onClick={handleCancel}>
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
