import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaTrashAlt } from "react-icons/fa";
import UploadVideoField from "../../../common/UploadVideoField/UploadVideoField";
import {
  eliminarArchivoDesdeFrontend,
} from "../../../../services/uploadCloudinary";
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

  const addNewVideo = () => {
    const newId = uuidv4();

    setFormData((prev) => {
      const updated = { ...prev };

      // Agregar el nuevo ID al array global
      updated.videoIds = [...(prev.videoIds || []), newId];

      // En cada idioma, asegurarse de que tenga ese ID aunque esté vacío
      ["es", "en", "fr"].forEach((lang) => {
        const langVideos = updated[lang]?.videos || [];
        if (!langVideos.some((v) => v._id === newId)) {
          updated[lang] = {
            ...(updated[lang] || {}),
            videos: [
              ...langVideos,
              {
                _id: newId,
                url: {},
                title: {},
                description: {},
              },
            ],
          };
        }
      });

      return updated;
    });
  };

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

      <h3>📄 PDFs</h3>
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

      <h3>🎥 Videos</h3>
      {formData.videoIds?.map((videoId) => {
        const currentVideo = formData[activeTab]?.videos?.find(
          (v) => v._id === videoId
        ) || {
          _id: videoId,
          url: {},
          title: {},
          description: {},
        };

        return (
          <div key={videoId} className="video-entry">
            <UploadVideoField
              activeLang={activeTab}
              video={currentVideo}
              onUploadSuccess={(videoPartial) => {
                setFormData((prev) => {
                  const lang = activeTab;
                  const currentVideos = prev[lang]?.videos || [];

                  const updatedVideos = currentVideos.some(
                    (v) => v._id === videoId
                  )
                    ? currentVideos.map((v) =>
                        v._id === videoId
                          ? {
                              ...v,
                              url: { ...v.url, ...videoPartial.url },
                              title: { ...v.title, ...videoPartial.title },
                              description: {
                                ...v.description,
                                ...videoPartial.description,
                              },
                            }
                          : v
                      )
                    : [
                        ...currentVideos,
                        {
                          _id: videoId,
                          url: videoPartial.url,
                          title: videoPartial.title,
                          description: videoPartial.description,
                        },
                      ];

                  return {
                    ...prev,
                    [lang]: {
                      ...(prev[lang] || {}),
                      videos: updatedVideos,
                    },
                  };
                });

                // 🧠 Guardar la URL para poder borrarla al cancelar
                const newUrl = videoPartial.url?.[activeTab];
                if (newUrl) {
                  setTempVideoUrls((prev) =>
                    prev.includes(newUrl) ? prev : [...prev, newUrl]
                  );
                }
              }}
            />
          </div>
        );
      })}

      <button type="button" onClick={addNewVideo}>
        ➕ Agregar Video
      </button>

      <div className="content-button-modal">
        <button type="button" onClick={onSubmit}>
          ✅ Crear Clase
        </button>
        <button type="button" onClick={handleCancel}>
          ❌ Cancelar
        </button>
      </div>
    </>
  );
};

export default AddCourseClassForm;
