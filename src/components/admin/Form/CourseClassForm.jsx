import UploadVideoField from "../../common/UploadVideoField/UploadVideoField";
import "./CourseForm.css";
import UploadPdfPrivadoField from "../../common/UploadPdfPrivadoField/UploadPdfPrivadoField";
import { useState, useRef } from "react";
import validateCourseClassForm from "../../../utils/validations/validateCourseClassForm";
import { eliminarArchivoDesdeFrontend } from "../../../services/uploadCloudinary";
import { eliminarVideoDeVimeo } from "../../../services/uploadVimeoService";

const CourseClassForm = ({
  formData,
  setFormData,
  activeTab,
  onCancel,
  onSave,
  tempUploads,      // 👈 lo necesitamos para leer PDFs/videos temporales
  setTempUploads,
}) => {
  const [errors, setErrors] = useState({});
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  // Helpers de temporales (sin side effects raros)
  const isTempPdf = (id) =>
    !!id && Array.isArray(tempUploads?.pdfs) && tempUploads.pdfs.includes(id);

  const isTempVideo = (url) =>
    !!url && Array.isArray(tempUploads?.videos) && tempUploads.videos.includes(url);

  const handleChange = (e, field, lang) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [lang]: value,
      },
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateCourseClassForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.keys(validationErrors)[0];

      const fieldRefMap = { title: titleRef, content: contentRef };
      const ref = fieldRefMap[firstError];
      if (ref && ref.current) ref.current.focus();

      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-section">
        <label className="label-formulario">Titulo:</label>
        <input
          type="text"
          ref={titleRef}
          value={formData.title?.[activeTab] || ""}
          onChange={(e) => handleChange(e, "title", activeTab)}
        />
        {errors.title && <div className="field-error">{errors.title}</div>}
      </div>

      <div className="form-section">
        <label className="label-formulario">Contenido:</label>
        <textarea
          ref={contentRef}
          value={formData.content?.[activeTab] || ""}
          onChange={(e) => handleChange(e, "content", activeTab)}
        />
        {errors.content && <div className="field-error">{errors.content}</div>}
      </div>

      <div className="form-section">
        <label className="label-formulario">Subtítulo:</label>
        <input
          type="text"
          value={formData.subtitle?.[activeTab] || ""}
          onChange={(e) => handleChange(e, "subtitle", activeTab)}
        />
      </div>

      <div className="form-section">
        <label className="label-formulario">Contenido secundario:</label>
        <textarea
          value={formData.secondaryContent?.[activeTab] || ""}
          onChange={(e) => handleChange(e, "secondaryContent", activeTab)}
        />
      </div>

      {/* PDFs */}
      <div className="form-section">
        <label className="label-formulario">PDFs:</label>
        <UploadPdfPrivadoField
          activeTab={activeTab}
          existingPdfs={Array.isArray(formData.pdfs) ? formData.pdfs : []}
          // ⬇️ setPdfs recibe SIEMPRE un array actualizado (no una función)
          setPdfs={(pdfList) =>
            setFormData((prev) => ({
              ...prev,
              pdfs: Array.isArray(pdfList) ? pdfList : [],
            }))
          }
          onPdfUploaded={(nuevoPdf) =>
            setFormData((prev) => {
              const listaActual = Array.isArray(prev.pdfs) ? prev.pdfs : [];
              return { ...prev, pdfs: [...listaActual, nuevoPdf] };
            })
          }
          onTempPublicId={(publicId) =>
            setTempUploads((prev) => ({
              ...prev,
              pdfs: [...prev.pdfs, publicId],
            }))
          }
          // 💡 Decide borrar YA (temp) vs. marcar (persistente)
          isTempPublicId={isTempPdf}
          onDeleteTempNow={async (id) => {
            try {
              await eliminarArchivoDesdeFrontend(id, "raw");
              setTempUploads((prev) => ({
                ...prev,
                pdfs: prev.pdfs.filter((x) => x !== id),
              }));
            } catch (e) {
              console.warn(e);
            }
          }}
          onMarkForDeletion={(id) =>
            setTempUploads((prev) => ({
              ...prev,
              pdfsAEliminar: [...(prev.pdfsAEliminar || []), id],
            }))
          }
        />
      </div>

      {/* Videos */}
      <div className="form-section">
        <label className="label-formulario">Videos:</label>
        <UploadVideoField
          activeLang={activeTab}
          // 🔧 Unificamos: en edición, usá el array plano formData.videos
          videos={Array.isArray(formData.videos) ? formData.videos : []}
          onChange={(updatedList) =>
            setFormData((prev) => ({
              ...prev,
              videos: updatedList,
            }))
          }
          onTempUpload={(url) =>
            setTempUploads((prev) => ({
              ...prev,
              videos: [...prev.videos, url],
            }))
          }
          onMarkDelete={(url) =>
            setTempUploads((prev) => ({
              ...prev,
              videosAEliminar: [...(prev.videosAEliminar || []), url],
            }))
          }
          isTempVideoUrl={isTempVideo}
          onDeleteTempNow={async (url) => {
            try {
              await eliminarVideoDeVimeo(url);
              setTempUploads((prev) => ({
                ...prev,
                videos: prev.videos.filter((v) => v !== url),
              }));
            } catch (e) {
              console.warn(e);
            }
          }}
        />
      </div>

      {/* Botones */}
      <div className="form-buttons">
        <button className="boton-agregar" type="submit">
          💾 Guardar
        </button>
        <button className="boton-eliminar" type="button" onClick={onCancel}>
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default CourseClassForm;
