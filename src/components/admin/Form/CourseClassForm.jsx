import UploadVideoField from "../../common/UploadVideoField/UploadVideoField";
import "./CourseForm.css";
import UploadPdfPrivadoField from "../../common/UploadPdfPrivadoField/UploadPdfPrivadoField";
import { eliminarVideoDeVimeo } from "../../../services/uploadVimeoService";

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
        <UploadVideoField
          activeLang={activeTab}
          videos={[
            ...(formData[activeTab]?.videos || []),
            ...(Array.isArray(formData.videos) ? formData.videos : []),
          ]}
          onChange={(updatedList) =>
            setFormData((prev) => {
              const updatedVideos = [...(prev.videos || [])];

              updatedList.forEach((newVideo) => {
                const index = updatedVideos.findIndex(
                  (v) => v._id === newVideo._id
                );
                if (index !== -1) {
                  // fusionamos info por idioma
                  updatedVideos[index] = {
                    ...updatedVideos[index],
                    url: { ...updatedVideos[index].url, ...newVideo.url },
                    title: { ...updatedVideos[index].title, ...newVideo.title },
                    description: {
                      ...updatedVideos[index].description,
                      ...newVideo.description,
                    },
                  };
                } else {
                  updatedVideos.push(newVideo);
                }
              });

              return {
                ...prev,
                videos: updatedVideos,
              };
            })
          }
          onTempUpload={(url) =>
            setTempUploads((prev) => ({
              ...prev,
              videos: [...prev.videos, url],
            }))
          }
        />
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
