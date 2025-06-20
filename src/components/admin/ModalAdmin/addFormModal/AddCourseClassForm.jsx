import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaTrashAlt } from "react-icons/fa";
import UploadVideoField from "../../UploadVideoField/UploadVideoField";
import {
  eliminarArchivoDesdeFrontend,
  subirPdfPrivado,
} from "../../../../services/uploadCloudinary";
import { eliminarVideoDeVimeo } from "../../../../services/uploadVimeoService";

const AddCourseClassForm = ({
  formData,
  setFormData,
  activeTab,
  errors,
  onClose,
  onSubmit,
}) => {
  const inputClass = (field) => (errors?.[field] ? "input error" : "input");

  const [pdfInputs, setPdfInputs] = useState([]);
  const [tempPdfPublicIds, setTempPdfPublicIds] = useState([]);
  const [tempVideoUrls, setTempVideoUrls] = useState([]);

  const addNewPDF = () => {
    setPdfInputs((prev) => [
      ...prev,
      {
        _id: uuidv4(),
        file: null,
        title: { es: "", en: "", fr: "" },
        description: { es: "", en: "", fr: "" },
        uploading: false,
      },
    ]);
  };

  const handleFileChange = (index, file) => {
    const updated = [...pdfInputs];
    updated[index].file = file;
    setPdfInputs(updated);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...pdfInputs];
    updated[index][field][activeTab] = value;
    setPdfInputs(updated);
  };

  const subirPDF = async (index) => {
    const pdf = pdfInputs[index];
    if (!pdf.file) return alert("Seleccioná un archivo PDF primero.");

    const titulo = pdf.title?.[activeTab]?.trim();
    if (!titulo) return alert("Escribí un título antes de subir el PDF.");

    try {
      const updated = [...pdfInputs];
      updated[index].uploading = true;
      setPdfInputs(updated);

      // 🔥 Le pasamos el título como segundo argumento para usar como nombre en Cloudinary
      const { url, public_id } = await subirPdfPrivado(pdf.file, titulo);

      const nuevoPdf = {
        _id: pdf._id,
        url: { es: "", en: "", fr: "" },
        public_id: { es: "", en: "", fr: "" },
        title: pdf.title,
        description: pdf.description,
      };
      nuevoPdf.url[activeTab] = url;
      nuevoPdf.public_id[activeTab] = public_id;

      setFormData((prev) => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          pdfs: [...(prev[activeTab]?.pdfs || []), nuevoPdf],
        },
      }));

      setTempPdfPublicIds((prev) => [...prev, public_id]);

      setPdfInputs((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("❌ Error al subir PDF:", err);
      alert("Error al subir el PDF.");
    }
  };

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
      {formData[activeTab]?.pdfs?.map((pdf, i) => (
        <div key={pdf._id} className="video-preview-item">
          <p>
            <strong>{pdf.title?.[activeTab]}</strong>
          </p>
          <p style={{ fontStyle: "italic" }}>
            {pdf.description?.[activeTab] || "Sin descripción"}
          </p>
          <button
            type="button"
            className="delete-button"
            onClick={async () => {
              const publicId = pdf.public_id?.[activeTab];
              if (publicId) await eliminarArchivoDesdeFrontend(publicId);
              setFormData((prev) => ({
                ...prev,
                [activeTab]: {
                  ...prev[activeTab],
                  pdfs: prev[activeTab].pdfs.filter((p) => p._id !== pdf._id),
                },
              }));
            }}
          >
            <FaTrashAlt />
          </button>
        </div>
      ))}

      {pdfInputs.map((pdf, i) => (
        <div key={pdf._id} className="pdf-entry">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileChange(i, e.target.files[0])}
          />
          <input
            type="text"
            placeholder="Título"
            value={pdf.title[activeTab]}
            onChange={(e) => handleInputChange(i, "title", e.target.value)}
          />
          <input
            type="text"
            placeholder="Descripción"
            value={pdf.description[activeTab]}
            onChange={(e) =>
              handleInputChange(i, "description", e.target.value)
            }
          />
          <button
            type="button"
            onClick={() => subirPDF(i)}
            disabled={pdf.uploading}
          >
            {pdf.uploading ? "Subiendo..." : "📤 Subir PDF"}
          </button>
        </div>
      ))}

      <button type="button" onClick={addNewPDF}>
        ➕ Agregar PDF
      </button>

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
