import { useState } from "react";
import "./AddItemModal.css";
import {
  createCourse,
  createCourseClass,
} from "../../../services/courseService";
import UploadVideoField from "../UploadVideoField/UploadVideoField";
import { FaTrashAlt } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { eliminarVideoDeVimeo } from "../../../services/uploadVimeoService";

const AddCoursesModal = ({
  courseId,
  onClose,
  onClassAdded,
  onCourseAdded,
}) => {
  const isAddingCourse = !courseId;
  const [activeTab, setActiveTab] = useState("es");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: { es: "", en: "", fr: "" },
    description: { es: "", en: "", fr: "" },
    price: "",
    image: { es: "", en: "", fr: "" },
    pdf: { es: "", en: "", fr: "" },
    video: { es: "", en: "", fr: "" },
    subtitle: { es: "", en: "", fr: "" },
    content: { es: "", en: "", fr: "" },
    secondaryContent: { es: "", en: "", fr: "" },
    pdfs: [],
    videos: [],
    visible: {
      es: true,
      en: false,
      fr: false,
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [activeTab]: value,
      },
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title.es)
      newErrors.title = "El título en español es obligatorio.";

    if (isAddingCourse) {
      if (!formData.description.es)
        newErrors.description = "La descripción en español es obligatoria.";
      if (!formData.price || parseFloat(formData.price) <= 0)
        newErrors.price = "El precio debe ser mayor a 0.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isAddingCourse) {
        const payload = {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          image: formData.image,
          pdf: formData.pdf,
          video: formData.video,
        };
        const response = await createCourse(payload);
        onCourseAdded?.(response);
        onClose(); // ✅ solo si se creó correctamente
      } else {
        const payload = {
          title: formData.title,
          subtitle: formData.subtitle,
          content: formData.content,
          secondaryContent: formData.secondaryContent,
          pdfs: formData.pdfs || [],
          videos: formData.videos || [],
          visible: formData.visible,
          course: courseId,
        };
        const response = await createCourseClass(courseId, payload);
        onClassAdded?.(response);
        onClose(); // ✅ solo si se creó correctamente
      }
    } catch (error) {
      console.error(
        "❌ Error al crear:",
        error.response?.data || error.message
      );
      setErrors({
        global: error.response?.data?.error || "Error inesperado al crear.",
      });
    }
  };

  const inputClass = (field) => (errors[field] ? "error" : "");

  const addNewPDF = () => {
    setFormData((prev) => ({
      ...prev,
      pdfs: [
        ...(prev.pdfs || []),
        {
          url: { es: "", en: "", fr: "" },
          title: { es: "", en: "", fr: "" },
          description: { es: "", en: "", fr: "" },
        },
      ],
    }));
  };

  const addNewVideo = () => {
    setFormData((prev) => ({
      ...prev,
      videos: [
        ...(prev.videos || []),
        {
          _id: uuidv4(),
          url: { es: "", en: "", fr: "" },
          title: { es: "", en: "", fr: "" },
          description: { es: "", en: "", fr: "" },
        },
      ],
    }));
  };

  const handlePDFChange = (index, field, value) => {
    const updated = [...formData.pdfs];
    updated[index][field][activeTab] = value;
    setFormData((prev) => ({ ...prev, pdfs: updated }));
  };

  /*   const handleVideoChange = (index, field, value) => {
    const updated = [...formData.videos];
    updated[index][field][activeTab] = value;
    setFormData((prev) => ({ ...prev, videos: updated }));
  }; */

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

        {errors.global && <p className="error-message">⚠️ {errors.global}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title[activeTab]}
            onChange={handleChange}
            placeholder={`Título (${activeTab})`}
            className={inputClass("title")}
          />
          {errors.title && <div className="field-error">{errors.title}</div>}

          {isAddingCourse ? (
            <>
              <textarea
                name="description"
                value={formData.description[activeTab]}
                onChange={handleChange}
                placeholder={`Descripción (${activeTab})`}
                className={inputClass("description")}
              />
              {errors.description && (
                <div className="field-error">{errors.description}</div>
              )}

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="Precio"
                className={inputClass("price")}
              />
              {errors.price && (
                <div className="field-error">{errors.price}</div>
              )}

              <input
                type="text"
                name="image"
                value={formData.image[activeTab]}
                onChange={handleChange}
                placeholder={`Imagen (${activeTab})`}
              />
              <input
                type="text"
                name="pdf"
                value={formData.pdf[activeTab]}
                onChange={handleChange}
                placeholder={`PDF (${activeTab})`}
              />
              <input
                type="text"
                name="video"
                value={formData.video[activeTab]}
                onChange={handleChange}
                placeholder={`Video (${activeTab})`}
              />
            </>
          ) : (
            <>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle[activeTab]}
                onChange={handleChange}
                placeholder={`Subtítulo (${activeTab})`}
              />
              <textarea
                name="content"
                value={formData.content[activeTab]}
                onChange={handleChange}
                placeholder={`Contenido (${activeTab})`}
              />
              <textarea
                name="secondaryContent"
                value={formData.secondaryContent[activeTab]}
                onChange={handleChange}
                placeholder={`Contenido secundario (${activeTab})`}
              />

              <h3>📄 PDFs</h3>
              {(formData.pdfs || []).map((pdf, i) => (
                <div key={i} className="pdf-entry">
                  <input
                    type="text"
                    placeholder="URL"
                    value={pdf.url[activeTab]}
                    onChange={(e) => handlePDFChange(i, "url", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Título"
                    value={pdf.title[activeTab]}
                    onChange={(e) =>
                      handlePDFChange(i, "title", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={pdf.description[activeTab]}
                    onChange={(e) =>
                      handlePDFChange(i, "description", e.target.value)
                    }
                  />
                </div>
              ))}
              <button type="button" onClick={addNewPDF}>
                ➕ Agregar PDF
              </button>

              <h3>🎥 Videos</h3>
              {(formData.videos || []).map((video) => {
                const yaSubido = video.url?.[activeTab];

                return (
                  <div key={video._id} className="video-entry">
                    {!yaSubido ? (
                      <UploadVideoField
                        activeLang={activeTab}
                        videoId={video._id}
                        onUploadSuccess={(videoObj) => {
                          setFormData((prev) => ({
                            ...prev,
                            videos: prev.videos.map((v) =>
                              v._id === video._id
                                ? { ...videoObj, _id: video._id }
                                : v
                            ),
                          }));
                        }}
                      />
                    ) : (
                      <div className="uploaded-summary">
                        <div className="video-summary-text">
                          🎥 <strong>{video.title?.[activeTab]}</strong>
                          <p className="video-description">
                            {video.description?.[activeTab] ||
                              "Sin descripción"}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={async () => {
                            const videoUrl = video.url?.[activeTab];
                            if (videoUrl) {
                              try {
                                await eliminarVideoDeVimeo(videoUrl);
                                console.log("✅ Video eliminado de Vimeo");

                                // Ahora sí eliminar del formulario
                                const updated = formData.videos.filter(
                                  (v) => v._id !== video._id
                                );
                                setFormData((prev) => ({
                                  ...prev,
                                  videos: updated,
                                }));
                              } catch (err) {
                                console.error(
                                  "❌ Error al eliminar video de Vimeo:",
                                  err
                                );
                                alert(
                                  "Hubo un error al eliminar el video de Vimeo. Intenta nuevamente."
                                );
                              }
                            }
                          }}
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              <button type="button" onClick={addNewVideo}>
                ➕ Agregar Video
              </button>
            </>
          )}

          <div className="content-button-modal">
            <button type="submit">✅ Agregar</button>
            <button
              type="button"
              onClick={async () => {
                const subidos = formData.videos?.filter(
                  (v) => v.url?.[activeTab]
                );

                for (const v of subidos) {
                  try {
                    await eliminarVideoDeVimeo(v.url[activeTab]);
                    console.log(
                      "🗑 Video eliminado al cancelar:",
                      v.title?.[activeTab]
                    );
                  } catch (err) {
                    console.error(
                      "❌ Error al eliminar video al cancelar:",
                      err
                    );
                  }
                }

                onClose();
              }}
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCoursesModal;
