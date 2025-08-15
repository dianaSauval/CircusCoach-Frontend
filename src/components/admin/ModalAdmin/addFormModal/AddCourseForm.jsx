import UploadPdfPublicoField from "../../../common/UploadPdfPublicoField/UploadPdfPublicoField";
import UploadImagenField from "../../../common/UploadImagenField/UploadImagenField";
import VideoPromocionalForm from "../../../common/VideoPromocionalForm/VideoPromocionalForm";
import "./AddCourseForm.css";
import { eliminarArchivoDesdeFrontend } from "../../../../services/uploadCloudinary";

const AddCourseForm = ({
  titleRef,
  descriptionRef,
  activeTab,
  formData,
  setFormData,
  inputClass,
  errors,
  onTempPdf,
  onTempVideo,
  onTempImage,
  setErrors,
  isTempPdfPublicId,
  onDeleteTempPdfNow,
  isTempVideoUrl,
  onDeleteTempVideoNow,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Actualiza el valor del campo
    setFormData((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [activeTab]: value,
      },
    }));

    // Limpia el error si existía para ese campo
    if (errors[name]) {
      setErrors((prevErrors) => {
        const updated = { ...prevErrors };
        delete updated[name];
        return updated;
      });
    }
  };

  return (
    <div className="add-course-form">
      <div className="nota-form-aviso">
        ⚠️ Solo es obligatorio completar el contenido en español para crear el
        curso. Los demás idiomas podés completarlos luego.
      </div>

      <input
        type="text"
        name="title"
        ref={titleRef}
        value={formData.title[activeTab]}
        onChange={handleChange}
        placeholder={`Título (${activeTab})`}
        className={inputClass("title")}
      />
      {errors.title && <div className="field-error">{errors.title}</div>}

      <textarea
        ref={descriptionRef}
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
        onChange={(e) => {
          const value = e.target.value;
          setFormData((prev) => ({ ...prev, price: value }));

          if (errors.price) {
            setErrors((prevErrors) => {
              const updated = { ...prevErrors };
              delete updated.price;
              return updated;
            });
          }
        }}
        placeholder="Precio"
        className={inputClass("price")}
      />

      {errors.price && <div className="field-error">{errors.price}</div>}

      <UploadImagenField
        activeLang={activeTab}
        value={formData.image[activeTab]}
        publicIdActual={formData.image_public_id?.[activeTab] || ""}
        onChange={(url, publicId) => {
          setFormData((prev) => ({
            ...prev,
            image: { ...prev.image, [activeTab]: url },
            image_public_id: { ...prev.image_public_id, [activeTab]: publicId },
          }));
          onTempImage?.(publicId);
        }}
        onMarkForDeletion={() => {
          // En el modal no hay “persistidos”; por seguridad, si llega acá, vaciamos visualmente
          setFormData((prev) => ({
            ...prev,
            image: { ...prev.image, [activeTab]: "" },
            image_public_id: { ...prev.image_public_id, [activeTab]: "" },
          }));
        }}
        onDeleteTempNow={async (id) => {
          try {
            await eliminarArchivoDesdeFrontend(id, "image");
          } catch (e) {
            console.warn(e);
          }
          setFormData((prev) => ({
            ...prev,
            image: { ...prev.image, [activeTab]: "" },
            image_public_id: { ...prev.image_public_id, [activeTab]: "" },
          }));
        }}
        isTempPublicId={() => true}
      />
      {errors.image && <div className="field-error">{errors.image}</div>}

      <label className="subtitulo">
        PDF de presentación del curso ({activeTab}) (Opcional)
      </label>
      <UploadPdfPublicoField
        activeLang={activeTab}
        pdfUrl={formData.pdf}
        setPdfUrl={(updater) =>
          setFormData((prev) => ({
            ...prev,
            pdf: typeof updater === "function" ? updater(prev.pdf) : updater,
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
        onTempUpload={(id) => onTempPdf?.(id)} // track temporal
        isTempPublicId={(id) => isTempPdfPublicId?.(id)} // dice si es temporal
        onDeleteTempNow={async (id) => {
          // 🔥 borra YA
          await onDeleteTempPdfNow?.(id);
          setFormData((prev) => ({
            ...prev,
            pdf: { ...prev.pdf, [activeTab]: "" },
            public_id_pdf: { ...prev.public_id_pdf, [activeTab]: "" },
          }));
        }}
      />

      <VideoPromocionalForm
        formData={formData}
        setFormData={setFormData}
        activeTab={activeTab}
        onTempUpload={(url) => onTempVideo?.(url)} // track como TEMP
        isTempVideoUrl={(url) => isTempVideoUrl?.(url)} // dice si es TEMP
        onDeleteTempNow={async (url) => {
          // 🔥 borrar YA
          await onDeleteTempVideoNow?.(url);
          // limpiar visualmente
          setFormData((prev) => ({
            ...prev,
            video: { ...(prev?.video || {}), [activeTab]: "" },
          }));
        }}
      />
    </div>
  );
};

export default AddCourseForm;
