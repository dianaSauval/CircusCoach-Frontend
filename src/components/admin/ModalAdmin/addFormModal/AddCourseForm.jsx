import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import {
  eliminarArchivoDesdeFrontend,
  subirPdfPublico,
} from "../../../../services/uploadCloudinary";
import { createCourse } from "../../../../services/courseService";

const AddCourseForm = ({
  activeTab,
  onSubmitSuccess,
  onClose,
  setErrors,
  errors,
  inputClass,
}) => {
  const [formData, setFormData] = useState({
    title: { es: "", en: "", fr: "" },
    description: { es: "", en: "", fr: "" },
    image: { es: "", en: "", fr: "" },
    pdf: { es: "", en: "", fr: "" },
    public_id_pdf: { es: "", en: "", fr: "" },
    video: { es: "", en: "", fr: "" },
    price: "",
    visible: { es: false, en: false, fr: false },
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
  };

  const handleUploadPdfPublico = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf";
    fileInput.click();

    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      if (!file) return;

      try {
        const { url, public_id } = await subirPdfPublico(file);
        setFormData((prev) => ({
          ...prev,
          pdf: { ...prev.pdf, [activeTab]: url },
          public_id_pdf: { ...prev.public_id_pdf, [activeTab]: public_id },
        }));
      } catch (err) {
        console.error("❌ Error al subir PDF público:", err);
        alert("Error al subir el PDF público");
      }
    };
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!formData.title[activeTab]) newErrors.title = "Título requerido";
    if (!formData.description[activeTab])
      newErrors.description = "Descripción requerida";
    if (!formData.price) newErrors.price = "Precio requerido";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const created = await createCourse(formData);
      onSubmitSuccess(created);
      onClose();
    } catch (err) {
      console.error("❌ Error al crear curso:", err);
      alert("Error al crear el curso.");
    }
  };

  const handleCancel = async () => {
    // Eliminamos los PDFs subidos en todos los idiomas, si existen
    for (const lang of ["es", "en", "fr"]) {
      const publicId = formData.public_id_pdf?.[lang];
      if (publicId) {
        try {
          await eliminarArchivoDesdeFrontend(publicId);
          console.log(`🗑️ PDF en ${lang} eliminado correctamente`);
        } catch (err) {
          console.warn(
            `⚠️ No se pudo eliminar el PDF en ${lang}:`,
            err.message
          );
        }
      }
    }

    onClose();
  };

  return (
    <div className="add-course-form">
      <input
        type="text"
        name="title"
        value={formData.title[activeTab]}
        onChange={handleChange}
        placeholder={`Título (${activeTab})`}
        className={inputClass("title")}
      />
      {errors.title && <div className="field-error">{errors.title}</div>}

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
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        placeholder="Precio"
        className={inputClass("price")}
      />
      {errors.price && <div className="field-error">{errors.price}</div>}

      <input
        type="text"
        name="image"
        value={formData.image[activeTab]}
        onChange={handleChange}
        placeholder={`Imagen (${activeTab})`}
      />

      <div className="upload-field">
        {formData.pdf[activeTab] ? (
          <div className="uploaded-summary">
            <a
              href={formData.pdf[activeTab]}
              target="_blank"
              rel="noopener noreferrer"
            >
              📄 Ver PDF subido
            </a>
            <button
              type="button"
              className="delete-button"
              onClick={async () => {
                const publicId = formData.public_id_pdf?.[activeTab];
                if (publicId) await eliminarArchivoDesdeFrontend(publicId);
                setFormData((prev) => ({
                  ...prev,
                  pdf: { ...prev.pdf, [activeTab]: "" },
                  public_id_pdf: { ...prev.public_id_pdf, [activeTab]: "" },
                }));
              }}
            >
              <FaTrashAlt />
            </button>
          </div>
        ) : (
          <button type="button" onClick={handleUploadPdfPublico}>
            📤 Subir PDF
          </button>
        )}
      </div>

      <input
        type="text"
        name="video"
        value={formData.video[activeTab]}
        onChange={handleChange}
        placeholder={`Video (${activeTab})`}
      />

      <div className="modal-buttons">
        <button className="btn red" onClick={handleCancel}>
          Cancelar
        </button>

        <button className="btn green" onClick={handleSubmit}>
          Agregar Curso
        </button>
      </div>
    </div>
  );
};

export default AddCourseForm;
