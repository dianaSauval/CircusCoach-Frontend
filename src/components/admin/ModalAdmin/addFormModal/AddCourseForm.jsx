import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { eliminarArchivoDesdeFrontend } from "../../../../services/uploadCloudinary";
import { createCourse } from "../../../../services/courseService";
import UploadPdfPublicoField from "../../../common/UploadPdfPublicoField/UploadPdfPublicoField";
import VideoPromocionalForm from "../../../common/VideoPromocionalForm/VideoPromocionalForm";
import UploadImagenField from "../../../common/UploadImagenField/UploadImagenField";
import { eliminarVideoDeVimeo } from "../../../../services/uploadVimeoService";
import "./AddCourseForm.css";


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
    image_public_id: { es: "", en: "", fr: "" },
    image: { es: "", en: "", fr: "" },
    pdf: { es: "", en: "", fr: "" },
    public_id_pdf: { es: "", en: "", fr: "" },
    video: { es: "", en: "", fr: "" },
    price: "",
    visible: { es: false, en: false, fr: false },
  });

  const [tempPublicIds, setTempPublicIds] = useState([]);
  const [tempVideoUrls, setTempVideoUrls] = useState([]);

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
      const transformedData = {
        ...formData,
        pdf: {
          es: formData.pdf.es?.url || "",
          en: formData.pdf.en?.url || "",
          fr: formData.pdf.fr?.url || "",
        },
      };

      const created = await createCourse(transformedData);

      onSubmitSuccess(created);
      onClose();
    } catch (err) {
      console.error("❌ Error al crear curso:", err);
      alert("Error al crear el curso.");
    }
  };

  const handleCancel = async () => {
    // Eliminamos los PDFs subidos temporalmente (por idioma activo)
    for (const id of tempPublicIds) {
      try {
        await eliminarArchivoDesdeFrontend(id, "raw");
        console.log(`🗑️ PDF con public_id ${id} eliminado correctamente`);
      } catch (err) {
        console.warn(`⚠️ No se pudo eliminar el PDF ${id}:`, err.message);
      }
    }

    const publicIdImagen = formData.image_public_id?.[activeTab];
    if (publicIdImagen) {
      try {
        await eliminarArchivoDesdeFrontend(publicIdImagen, "image"); // sin prefijo doble
        console.log(`🗑️ Imagen temporal eliminada: ${publicIdImagen}`);
      } catch (err) {
        console.warn(`⚠️ No se pudo eliminar la imagen temporal:`, err.message);
      }
    }

    // Eliminamos los videos subidos a Vimeo
    for (const videoUrl of tempVideoUrls) {
      if (videoUrl?.includes("vimeo.com")) {
        try {
          await eliminarVideoDeVimeo(videoUrl);
          console.log(`🗑️ Video eliminado de Vimeo: ${videoUrl}`);
        } catch (err) {
          console.warn(
            `⚠️ No se pudo eliminar el video: ${videoUrl}`,
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

      <UploadImagenField
        activeLang={activeTab}
        value={formData.image[activeTab]}
        onChange={(url, publicId) =>
          setFormData((prev) => ({
            ...prev,
            image: { ...prev.image, [activeTab]: url },
            image_public_id: { ...prev.image_public_id, [activeTab]: publicId }, // ✅ guardamos el id
          }))
        }
      />

      <label className="subtitulo">PDF de presentación del curso ({activeTab})</label>
      <UploadPdfPublicoField
        activeLang={activeTab}
        pdfUrl={formData.pdf}
        setPdfUrl={(updater) =>
          setFormData((prev) => ({
            ...prev,
            pdf:
              typeof updater === "function"
                ? updater(prev.pdf) // ✅ aplicar la función si lo es
                : updater,
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
        onTempUpload={(id) => setTempPublicIds((prev) => [...prev, id])}
      />

      <VideoPromocionalForm
        formData={formData}
        setFormData={setFormData}
        activeTab={activeTab}
        onAddTempVideo={
          (url) => setTempPublicIds((prev) => [...prev, url]) // si querés tener control para eliminarlos luego
        }
        onAddTempVideo={(url) => setTempVideoUrls((prev) => [...prev, url])}
      />

      <div className="modal-buttons">
        <button className="boton-eliminar" onClick={handleCancel}>
          Cancelar
        </button>

        <button className="boton-agregar" onClick={handleSubmit}>
          Agregar Curso
        </button>
      </div>
    </div>
  );
};

export default AddCourseForm;
