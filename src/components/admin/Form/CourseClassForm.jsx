import UploadVideoField from "../../common/UploadVideoField/UploadVideoField";
import "./CourseForm.css";
import UploadPdfPrivadoField from "../../common/UploadPdfPrivadoField/UploadPdfPrivadoField";
import { useState, useRef } from "react";
import validateCourseClassForm from "../../../utils/validations/validateCourseClassForm";

const CourseClassForm = ({
  formData,
  setFormData,
  activeTab,
  onCancel,
  onSave,
  setTempUploads,
}) => {
  const [errors, setErrors] = useState({});
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  const handleChange = (e, field, lang) => {
    const value = e.target.value;

    // Actualiza el formData
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [lang]: value,
      },
    }));

    // Elimina el error si existía
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

      const fieldRefMap = {
        title: titleRef,
        content: contentRef,
      };

      const ref = fieldRefMap[firstError];
      if (ref && ref.current) {
        ref.current.focus();
      }

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
        <label className="label-formulario">Videos:</label>
        <UploadVideoField
          activeLang={activeTab}
          videos={[
            ...(formData[activeTab]?.videos || []),
            ...(Array.isArray(formData.videos) ? formData.videos : []),
          ]}
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
