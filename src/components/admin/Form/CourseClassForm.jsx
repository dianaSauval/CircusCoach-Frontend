import UploadVideoField from "../../common/UploadVideoField/UploadVideoField";
import { FaTrashAlt } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { eliminarVideoDeVimeo } from "../../../services/uploadVimeoService";
import "./CourseForm.css";
import UploadPdfPrivadoField from "../../common/UploadPdfPrivadoField/UploadPdfPrivadoField";

const CourseClassForm = ({
  formData,
  setFormData,
  activeTab,
  onCancel,
  onSave,
  setTempUploads,
}) => {
  const handleChange = (e, field, lang) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [lang]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("🧠 FormData a guardar:", formData);

    onSave(formData);
  };

  const videoId = formData.videoIds?.[0];
  const video = formData[activeTab]?.videos?.find((v) => v._id === videoId);

  const addNewVideo = () => {
    const newId = uuidv4();

    setFormData((prev) => {
      const updated = { ...prev };

      // Agregamos un array global de IDs si no existe
      updated.videoIds = [...(prev.videoIds || []), newId];

      // Para cada idioma, nos aseguramos de que exista la entrada del video
      ["es", "en", "fr"].forEach((lang) => {
        const langVideos = updated[lang]?.videos || [];

        if (!langVideos.some((v) => v._id === newId)) {
          updated[lang] = {
            ...(updated[lang] || {}),
            videos: [
              ...langVideos,
              {
                _id: newId,
                url: {},
                title: {},
                description: {},
              },
            ],
          };
        }
      });

      return updated;
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-section">
        <label>Subtítulo:</label>
        <input
          type="text"
          value={formData.subtitle?.[activeTab] || ""}
          onChange={(e) => handleChange(e, "subtitle", activeTab)}
        />
      </div>

      <div className="form-section">
        <label>Contenido:</label>
        <textarea
          value={formData.content?.[activeTab] || ""}
          onChange={(e) => handleChange(e, "content", activeTab)}
        />
      </div>

      <div className="form-section">
        <label>Contenido secundario:</label>
        <textarea
          value={formData.secondaryContent?.[activeTab] || ""}
          onChange={(e) => handleChange(e, "secondaryContent", activeTab)}
        />
      </div>

      {/* PDFs */}
      <div className="form-section">
        <label>PDFs:</label>
        <UploadPdfPrivadoField
          activeTab={activeTab}
          existingPdfs={formData.pdfs || []}
          setPdfs={(pdfList) =>
            setFormData((prev) => ({
              ...prev,
              pdfs: pdfList,
            }))
          }
          onPdfUploaded={(nuevoPdf) =>
            setFormData((prev) => {
              const listaActual = Array.isArray(prev.pdfs) ? prev.pdfs : [];
              return {
                ...prev,
                pdfs: [...listaActual, nuevoPdf],
              };
            })
          }
          onTempPublicId={(publicId) =>
            setTempUploads((prev) => ({
              ...prev,
              pdfs: [...prev.pdfs, publicId],
            }))
          }
        />
      </div>

      {/* Videos */}
      <div className="form-section">
        <label>Videos:</label>

        {!video?._id && (
          <button type="button" onClick={addNewVideo}>
            ➕ Agregar Video
          </button>
        )}

        {videoId && video && (
          <UploadVideoField
            activeLang={activeTab}
            video={video}
            onUploadSuccess={(videoPartial) => {
              setFormData((prev) => {
                const current = prev[activeTab]?.videos || [];

                const updated = current.map((v) =>
                  v._id === videoPartial._id
                    ? {
                        ...v,
                        url: { ...v.url, ...videoPartial.url },
                        title: { ...v.title, ...videoPartial.title },
                        description: {
                          ...v.description,
                          ...videoPartial.description,
                        },
                      }
                    : v
                );

                return {
                  ...prev,
                  [activeTab]: {
                    ...(prev[activeTab] || {}),
                    videos: updated,
                  },
                };
              });
            }}
          />
        )}
        {formData.videoIds?.map((videoId) => {
          const video = formData[activeTab]?.videos?.find(
            (v) => v._id === videoId
          );

          if (!video?.url?.[activeTab]) return null;

          return (
            <div key={videoId} className="nested-section uploaded-summary">
              <div>
                🎥 <strong>{video.title?.[activeTab] || "Sin título"}</strong>
                <p className="video-description">
                  {video.description?.[activeTab] || "Sin descripción"}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await eliminarVideoDeVimeo(video.url[activeTab]);
                    setFormData((prev) => {
                      const updated = { ...prev };
                      updated[activeTab].videos = updated[
                        activeTab
                      ].videos.filter((v) => v._id !== videoId);
                      updated.videoIds = updated.videoIds.filter(
                        (id) => id !== videoId
                      );
                      return updated;
                    });
                  } catch (err) {
                    alert("Error al eliminar video.");
                  }
                }}
              >
                ❌
              </button>
            </div>
          );
        })}
      </div>

      {/* Botones */}
      <div className="form-buttons">
        <button type="submit">💾 Guardar</button>
        <button type="button" onClick={onCancel}>
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default CourseClassForm;
