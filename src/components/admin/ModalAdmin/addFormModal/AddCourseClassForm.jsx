import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaTrashAlt } from "react-icons/fa";
import UploadVideoField from "../../../common/UploadVideoField/UploadVideoField";
import { eliminarArchivoDesdeFrontend } from "../../../../services/uploadCloudinary";
import { eliminarVideoDeVimeo } from "../../../../services/uploadVimeoService";
import UploadPdfPrivadoField from "../../../common/UploadPdfPrivadoField/UploadPdfPrivadoField";

const AddCourseClassForm = ({
  formData,
  setFormData,
  activeTab,
  errors,
  onClose,
  onSubmit,
}) => {
  const inputClass = (field) => (errors?.[field] ? "input error" : "input");

  const [tempPdfPublicIds, setTempPdfPublicIds] = useState([]);
  const [tempVideoUrls, setTempVideoUrls] = useState([]);

  const handleCancel = async () => {
    for (const id of tempPdfPublicIds) {
      try {
        await eliminarArchivoDesdeFrontend(id);
      } catch (e) {
        console.warn("No se pudo borrar PDF temporal:", id);
      }
    }
    for (const url of tempVideoUrls) {
      try {
        await eliminarVideoDeVimeo(url);
      } catch (e) {
        console.warn("No se pudo borrar video temporal:", url);
      }
    }
    onClose();
  };

  return (
    <>
      <input
        type="text"
        name="title"
        value={formData.title?.[activeTab] || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            title: { ...formData.title, [activeTab]: e.target.value },
          })
        }
        placeholder={`Título (${activeTab})`}
        className={inputClass("title")}
      />

      <input
        type="text"
        name="subtitle"
        value={formData.subtitle?.[activeTab] || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            subtitle: { ...formData.subtitle, [activeTab]: e.target.value },
          })
        }
        placeholder={`Subtítulo (${activeTab})`}
        className={inputClass("subtitle")}
      />

      <textarea
        name="content"
        value={formData.content?.[activeTab] || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            content: { ...formData.content, [activeTab]: e.target.value },
          })
        }
        placeholder={`Contenido (${activeTab})`}
      />

      <textarea
        name="secondaryContent"
        value={formData.secondaryContent?.[activeTab] || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            secondaryContent: {
              ...formData.secondaryContent,
              [activeTab]: e.target.value,
            },
          })
        }
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
        onTempPublicId={(publicId) =>
          setTempPdfPublicIds((prev) => [...prev, publicId])
        }
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
        onTempUpload={(url) =>
          setTempVideoUrls((prev) =>
            prev.includes(url) ? prev : [...prev, url]
          )
        }
      />

      <div className="content-button-modal">
        <button type="button" className="boton-agregar" onClick={onSubmit}>
          ✅ Crear Clase
        </button>
        <button type="button" className="boton-eliminar" onClick={handleCancel}>
          ❌ Cancelar
        </button>
      </div>
    </>
  );
};

export default AddCourseClassForm;
