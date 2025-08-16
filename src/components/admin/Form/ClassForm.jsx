import { eliminarArchivoDesdeFrontend } from "../../../services/uploadCloudinary";
import { eliminarVideoDeVimeo } from "../../../services/uploadVimeoService";
import UploadPdfPrivadoField from "../../common/UploadPdfPrivadoField/UploadPdfPrivadoField";
import UploadVideoField from "../../common/UploadVideoField/UploadVideoField";
import "./Form.css";

const ClassForm = ({
  formData,
  setFormData,
  activeTab,
  tempUploads,
  setTempUploads,
}) => {
  // 🟡 Campos comunes (título, contenido, etc.)
  const handleTextChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: {
        ...formData[field],
        [activeTab]: value,
      },
    });
  };

  // 📌 Detectores de “temporal” (subido en esta edición)
  const isTempPdfPublicId = (id) =>
    !!id && Array.isArray(tempUploads?.pdfs) && tempUploads.pdfs.includes(id);
  const isTempVideoUrl = (url) =>
    !!url && Array.isArray(tempUploads?.videos) && tempUploads.videos.includes(url);

  return (
    <div className="class-form-container">
      <div className="input-group">
        <label>Título</label>
        <input
          type="text"
          value={formData?.title?.[activeTab] || ""}
          onChange={(e) => handleTextChange("title", e.target.value)}
          placeholder="Título"
        />
      </div>

      <div className="input-group">
        <label>Contenido Principal</label>
        <textarea
          value={formData?.content?.[activeTab] || ""}
          onChange={(e) => handleTextChange("content", e.target.value)}
          placeholder="Contenido principal"
        />
      </div>

      <div className="input-group">
        <label>Subtítulo</label>
        <input
          type="text"
          value={formData?.subtitle?.[activeTab] || ""}
          onChange={(e) => handleTextChange("subtitle", e.target.value)}
          placeholder="Subtítulo"
        />
      </div>

      <div className="input-group">
        <label>Contenido Secundario</label>
        <textarea
          value={formData?.secondaryContent?.[activeTab] || ""}
          onChange={(e) => handleTextChange("secondaryContent", e.target.value)}
          placeholder="Contenido secundario"
        />
      </div>

      <h3>📄 PDFs</h3>
      <UploadPdfPrivadoField
        activeTab={activeTab}
        existingPdfs={Array.isArray(formData.pdfs) ? formData.pdfs : []}
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
          setTempUploads?.((prev) => ({
            ...prev,
            pdfs: [...(prev?.pdfs || []), publicId],
          }))
        }
        // ⚖️ decidir si borrar YA o marcar para borrar al Guardar
        isTempPublicId={isTempPdfPublicId}
        onDeleteTempNow={async (publicId) => {
          try {
            await eliminarArchivoDesdeFrontend(publicId, "raw");
          } finally {
            setTempUploads((prev) => ({
              ...prev,
              pdfs: (prev.pdfs || []).filter((x) => x !== publicId),
            }));
          }
        }}
        onMarkForDeletion={(publicId) =>
          setTempUploads((prev) => ({
            ...prev,
            pdfsAEliminar: [...(prev.pdfsAEliminar || []), publicId],
          }))
        }
      />
      <h3 className="subtitulo">🎥 Videos</h3>
      <UploadVideoField
        activeLang={activeTab}
        videos={formData.videos || []}
        onChange={(nuevosVideos) =>
          setFormData((prev) => ({
            ...prev,
            videos: nuevosVideos,
          }))
        }
        onTempUpload={(url) =>
          setTempUploads((prev) => ({
            ...prev,
            videos: [...(prev.videos || []), url],
          }))
        }
        // ⚖️ idem: si es temporal → borrar YA, si no → marcar para Guardar
        isTempVideoUrl={isTempVideoUrl}
        onDeleteTempNow={async (url) => {
          try {
            await eliminarVideoDeVimeo(url);
          } finally {
            setTempUploads((prev) => ({
              ...prev,
              videos: (prev.videos || []).filter((v) => v !== url),
            }));
          }
        }}
        onMarkDelete={(url) =>
          setTempUploads((prev) => ({
            ...prev,
            videosAEliminar: [...(prev.videosAEliminar || []), url],
          }))
        }
      />
    </div>
  );
};

export default ClassForm;
