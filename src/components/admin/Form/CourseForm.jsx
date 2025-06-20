import { useEffect, useState } from "react";
import "./CourseForm.css";
import {
  eliminarVideoDeVimeo,
} from "../../../services/uploadVimeoService";
import {
  eliminarArchivoDesdeFrontend,
  subirPdfPublico,
} from "../../../services/uploadCloudinary";
import VideoPromocionalForm from "../VideoPromocionalForm/VideoPromocionalForm";
import CourseClassForm from "./CourseClassForm";

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
    if (!isClass) {
      setFormData((prev) => {
        const fixed = { ...prev };
        ["es", "en", "fr"].forEach((lang) => {
          if (typeof fixed.pdf?.[lang] === "object") {
            fixed.pdf[lang] = fixed.pdf[lang]?.url || "";
          }
          if (typeof fixed.video?.[lang] === "object") {
            fixed.video[lang] = fixed.video[lang]?.url || "";
          }
        });
        return fixed;
      });
    }
  }, [isClass]);

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
      <CourseClassForm
       formData={formData}
      setFormData={setFormData}
        initialData={initialData}
        activeTab={activeTab}
          onCancel={handleCancel}
  onSave={onSave}
  tempUploads={tempUploads}
  setTempUploads={setTempUploads}
      />
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
        es: data.pdf?.es || "",
        en: data.pdf?.en || "",
        fr: data.pdf?.fr || "",
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

  const handleUploadPdfCurso = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const { url, public_id } = await subirPdfPublico(file);
        setFormData((prev) => ({
          ...prev,
          pdf: { ...prev.pdf, [activeTab]: url },
          public_id_pdf: { ...prev.public_id_pdf, [activeTab]: public_id },
        }));
        setTempUploads((prev) => ({
          ...prev,
          pdfs: [...prev.pdfs, public_id],
        }));
      } catch (err) {
        console.error("❌ Error al subir PDF público:", err);
        alert("Hubo un error al subir el PDF. Intenta nuevamente.");
      }
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

        <div className="form-section">
          <div className="form-section">
            <label>PDF de presentación (URL):</label>
            {formData.pdf?.[activeTab] ? (
              <div className="nested-section uploaded-summary">
                <p>
                  ✅ PDF subido:{" "}
                  <a
                    href={formData.pdf[activeTab]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver archivo
                  </a>
                </p>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={async () => {
                    const publicId = formData.public_id_pdf?.[activeTab];
                    if (publicId) {
                      try {
                        await eliminarArchivoDesdeFrontend(publicId, "raw");
                        setFormData((prev) => ({
                          ...prev,
                          pdf: { ...prev.pdf, [activeTab]: "" },
                          public_id_pdf: {
                            ...prev.public_id_pdf,
                            [activeTab]: "",
                          },
                        }));
                        setTempUploads((prev) => ({
                          ...prev,
                          pdfs: prev.pdfs.filter((id) => id !== publicId),
                        }));
                      } catch (err) {
                        console.error("❌ Error al eliminar PDF:", err);
                        alert("Error al eliminar el PDF.");
                      }
                    }
                  }}
                >
                  ❌ Eliminar PDF
                </button>
              </div>
            ) : (
              <button type="button" onClick={handleUploadPdfCurso}>
                📤 Subir archivo PDF
              </button>
            )}
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
