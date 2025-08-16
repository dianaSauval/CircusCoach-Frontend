import UploadImagenField from "../../common/UploadImagenField/UploadImagenField";
import UploadPdfPublicoField from "../../common/UploadPdfPublicoField/UploadPdfPublicoField";
import VideoPromocionalForm from "../../common/VideoPromocionalForm/VideoPromocionalForm";

const FormationForm = ({
  formData,
  setFormData,
  activeTab,
  setTempUploads,
  onDeleteTempImageNow,
  isTempImagePublicId,
  isTempPublicId,
  onDeleteTempNow,
  originalPublicIdMap,
  isTempVideoUrl,
  onDeleteTempVideoNow,
  onMarkVideoForDeletion,
}) => {
  return (
    <>
      {/* 🔹 Título por idioma */}
      <input
        type="text"
        name="title"
        value={formData?.title?.[activeTab] || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            title: { ...formData.title, [activeTab]: e.target.value },
          })
        }
        placeholder={`Título (${activeTab.toUpperCase()})`}
      />

      {/* 🔹 Descripción por idioma */}
      <textarea
        name="description"
        value={formData?.description?.[activeTab] || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            description: {
              ...formData.description,
              [activeTab]: e.target.value,
            },
          })
        }
        placeholder={`Descripción (${activeTab.toUpperCase()})`}
      />

      {/* 🔹 Precio general */}
      <input
        type="number"
        name="price"
        value={formData?.price || ""}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        placeholder="Precio"
      />

      {/* 🔹 Imagen por idioma */}
      <label>URL de la imagen ({activeTab.toUpperCase()})</label>
      <UploadImagenField
        activeLang={activeTab}
        value={formData?.image?.[activeTab] || ""}
        publicIdActual={formData?.image_public_id?.[activeTab] || ""}
        onChange={(url, publicId) => {
          // nueva imagen → temp
          setFormData((prev) => ({
            ...prev,
            image: { ...prev.image, [activeTab]: url },
            image_public_id: {
              ...(prev.image_public_id || {}),
              [activeTab]: publicId,
            },
          }));
          setTempUploads((prev) => ({ ...prev, imagenNueva: publicId }));
        }}
        onMarkForDeletion={(id) => {
          // persistida → marcar y vaciar visualmente
          setTempUploads((prev) => ({
            ...prev,
            imagenesAEliminar: [...(prev.imagenesAEliminar || []), id],
          }));
          setFormData((prev) => ({
            ...prev,
            image: { ...prev.image, [activeTab]: "" },
            image_public_id: {
              ...(prev.image_public_id || {}),
              [activeTab]: "",
            },
          }));
        }}
        onDeleteTempNow={async (id) => {
          await onDeleteTempImageNow?.(id); // borra YA y limpia tempUploads.imagenNueva
          setFormData((prev) => ({
            ...prev,
            image: { ...prev.image, [activeTab]: "" },
            image_public_id: {
              ...(prev.image_public_id || {}),
              [activeTab]: "",
            },
          }));
        }}
        isTempPublicId={(id) => isTempImagePublicId?.(id)}
      />

      {/* 🔹 PDF por idioma */}
      <label>URL del PDF ({activeTab.toUpperCase()})</label>
      <UploadPdfPublicoField
        activeLang={activeTab}
        pdfUrl={formData.pdf}
        setPdfUrl={(updater) =>
          setFormData((prev) => ({
            ...prev,
            pdf: typeof updater === "function" ? updater(prev.pdf) : updater,
          }))
        }
        publicId={formData.pdf_public_id || {}}
        setPublicId={(updater) =>
          setFormData((prev) => ({
            ...prev,
            pdf_public_id:
              typeof updater === "function"
                ? updater(prev.pdf_public_id || {})
                : updater,
          }))
        }
        // ✅ dedupe: agregar solo si no está
        onTempUpload={(id) =>
          setTempUploads((prev) => ({
            ...prev,
            pdfs: prev.pdfs?.includes(id)
              ? prev.pdfs
              : [...(prev.pdfs || []), id],
          }))
        }
        onMarkForDeletion={(id) =>
          setTempUploads((prev) => {
            const item = { lang: activeTab, public_id: id };
            const yaEsta = (prev.pdfsAEliminar || []).some((x) =>
              typeof x === "string" ? x === id : x?.public_id === id
            );
            return {
              ...prev,
              pdfsAEliminar: yaEsta
                ? prev.pdfsAEliminar
                : [...(prev.pdfsAEliminar || []), item],
            };
          })
        }
        isTempPublicId={(id) => isTempPublicId?.(id)}
        onDeleteTempNow={async (id) => {
          await onDeleteTempNow?.(id); // 🔥 borrar YA en Cloudinary
          setFormData((prev) => ({
            ...prev,
            pdf: { ...prev.pdf, [activeTab]: "" },
            pdf_public_id: { ...(prev.pdf_public_id || {}), [activeTab]: "" },
          }));
        }}
        originalPublicId={originalPublicIdMap || {}}
      />

      {/* 🔹 Video por idioma */}
      <label>URL del video ({activeTab.toUpperCase()})</label>
      <VideoPromocionalForm
        formData={formData}
        setFormData={setFormData}
        activeTab={activeTab}
        // SUBIR (archivo nuestro) → temp
        onTempUpload={(url) =>
          setTempUploads?.((prev) => ({
            ...prev,
            videos: prev?.videos?.includes(url)
              ? prev.videos
              : [...(prev?.videos || []), url],
          }))
        }
        // PEGAR enlace externo → no es temp (solo limpiar si eliminan)
        isTempVideoUrl={(url) => isTempVideoUrl?.(url)}
        onDeleteTempNow={async (url) => {
          await onDeleteTempVideoNow?.(url); // 🔥 borrar YA en Vimeo
          setFormData((prev) => ({
            ...prev,
            video: { ...(prev?.video || {}), [activeTab]: "" },
          }));
        }}
        onMarkForDeletion={
          (url) => onMarkVideoForDeletion?.(url) // persistido: borrar al Guardar
        }
      />
    </>
  );
};

export default FormationForm;
