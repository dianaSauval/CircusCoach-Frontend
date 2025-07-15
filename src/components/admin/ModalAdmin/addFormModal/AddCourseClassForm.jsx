import UploadVideoField from "../../../common/UploadVideoField/UploadVideoField";
import UploadPdfPrivadoField from "../../../common/UploadPdfPrivadoField/UploadPdfPrivadoField";
import "./AddCourseForm.css";

const AddCourseClassForm = ({
  titleRef,
  contentRef,
  formData,
  setFormData,
  activeTab,
  errors,
  onTempPdf,
  onTempVideo,
  setErrors,
}) => {
  const inputClass = (field) => (errors?.[field] ? "input error" : "input");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [activeTab]: value,
      },
    }));

    if (errors[name]) {
      setErrors((prevErrors) => {
        const updated = { ...prevErrors };
        delete updated[name];
        return updated;
      });
    }
  };

  return (
    <>
      <div className="nota-form-aviso">
        ⚠️ Solo es obligatorio completar el título y contenido en español. Los
        demás idiomas podés editarlos más adelante desde el panel.
      </div>

      <input
        type="text"
        name="title"
        ref={titleRef}
        value={formData.title?.[activeTab] || ""}
        onChange={handleChange}
        placeholder={`Título (${activeTab})`}
        className={inputClass("title")}
      />
      {errors.title && <div className="field-error">{errors.title}</div>}

      <textarea
        ref={contentRef}
        name="content"
        value={formData.content?.[activeTab] || ""}
        onChange={handleChange}
        placeholder={`Contenido (${activeTab})`}
        className={inputClass("content")}
      />
      {errors.content && <div className="field-error">{errors.content}</div>}
      <input
        type="text"
        name="subtitle"
        value={formData.subtitle?.[activeTab] || ""}
        onChange={handleChange}
        placeholder={`Subtítulo (${activeTab})`}
        className={inputClass("subtitle")}
      />
      <textarea
        name="secondaryContent"
        value={formData.secondaryContent?.[activeTab] || ""}
        onChange={handleChange}
        placeholder={`Contenido secundario (${activeTab})`}
      />

      <h3 className="subtitulo">📄 PDFs</h3>
      <UploadPdfPrivadoField
        activeTab={activeTab}
        existingPdfs={formData[activeTab]?.pdfs || []}
        setPdfs={(pdfList) =>
          setFormData((prev) => ({
            ...prev,
            [activeTab]: {
              ...prev[activeTab],
              pdfs: pdfList,
            },
          }))
        }
        onPdfUploaded={(nuevoPdf) =>
          setFormData((prev) => ({
            ...prev,
            [activeTab]: {
              ...prev[activeTab],
              pdfs: [...(prev[activeTab]?.pdfs || []), nuevoPdf],
            },
          }))
        }
        onTempPublicId={onTempPdf}
      />

      <h3 className="subtitulo">🎥 Videos</h3>
      <UploadVideoField
        activeLang={activeTab}
        videos={formData[activeTab]?.videos || []}
        onChange={(updatedList) =>
          setFormData((prev) => ({
            ...prev,
            [activeTab]: {
              ...(prev[activeTab] || {}),
              videos: updatedList,
            },
          }))
        }
        onTempUpload={onTempVideo}
      />
    </>
  );
};

export default AddCourseClassForm;
