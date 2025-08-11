import UploadImagenField from "../../common/UploadImagenField/UploadImagenField";
import UploadPdfPublicoField from "../../common/UploadPdfPublicoField/UploadPdfPublicoField";
import VideoPromocionalForm from "../../common/VideoPromocionalForm/VideoPromocionalForm";

const FormationForm = ({
  formData,
  setFormData,
  activeTab,
  setTempUploads,
  isTempPublicId,
  onDeleteTempNow,
  originalPublicIdMap,
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
        onChange={(url) =>
          setFormData((prev) => ({
            ...prev,
            image: { ...prev.image, [activeTab]: url },
          }))
        }
        onMarkForDeletion={(id) =>
          setTempUploads((prev) => ({
            ...prev,
            imagenesAEliminar: [...(prev.imagenesAEliminar || []), id],
          }))
        }
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
      />

      {/* 🔹 Video por idioma */}
      <label>URL del video ({activeTab.toUpperCase()})</label>
      <VideoPromocionalForm
        formData={formData}
        setFormData={setFormData}
        activeTab={activeTab}
        onAddTempVideo={(vimeoId) => {
          console.log("📽️ Video temporal agregado:", vimeoId);
          setTempUploads?.((prev) => ({
            ...prev,
            videos: [...(prev?.videos || []), vimeoId],
          }));
        }}
        setTempUploads={setTempUploads}
      />
    </>
  );
};

export default FormationForm;
