import { useState } from "react";
import UploadVideoField from "../UploadVideoField/UploadVideoField";
import { FaTrashAlt } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import {
  subirPdfPrivado,
  eliminarArchivoDesdeFrontend,
} from "../../../services/uploadCloudinary";
import { eliminarVideoDeVimeo } from "../../../services/uploadVimeoService";
import "./CourseForm.css";

const CourseClassForm = ({
  formData,
  setFormData,
  activeTab,
  onCancel,
  onSave,
  tempUploads,
  setTempUploads,
}) => {
  const [pdfInputs, setPdfInputs] = useState([]);

  const handleChange = (e, field, lang) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [lang]: value,
      },
    }));
  };

  const handleAddPdfInput = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(); // o cualquier lógica que tengas para guardar
  };

  const handleAddUploadedVideo = (videoObj) => {
    // Esto asegura que UploadVideoField reciba un objeto con _id
    const videoWithId = {
      _id: uuidv4(),
      ...videoObj,
    };

    setFormData((prev) => ({
      ...prev,
      videos: [
        ...(prev.videos || []),
        {
          ...videoWithId,
          url: {
            ...((prev.videos?.[0]?.url || {}) ?? { es: "", en: "", fr: "" }),
            [activeTab]: videoWithId.url,
          },
          title: {
            ...((prev.videos?.[0]?.title || {}) ?? { es: "", en: "", fr: "" }),
            [activeTab]: videoWithId.title,
          },
          description: {
            ...((prev.videos?.[0]?.description || {}) ?? {
              es: "",
              en: "",
              fr: "",
            }),
            [activeTab]: videoWithId.description,
          },
        },
      ],
    }));
  };

  const handlePdfTextChange = (index, field, value) => {
    const updated = [...pdfInputs];
    updated[index][field][activeTab] = value;
    setPdfInputs(updated);
  };

  const handlePdfFileChange = (index, file) => {
    const updated = [...pdfInputs];
    updated[index].file = file;
    setPdfInputs(updated);
  };

  const handleUploadPdfArchivo = async (index) => {
    const pdf = pdfInputs[index];
    if (!pdf || !pdf.file) return alert("Seleccioná un archivo PDF primero.");
    const titulo = pdf.title?.[activeTab]?.trim();
    if (!titulo) return alert("Escribí un título antes de subir el PDF.");

    try {
      const updatedInputs = [...pdfInputs];
      updatedInputs[index].uploading = true;
      setPdfInputs(updatedInputs);

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
        pdfs: [...(prev.pdfs || []), nuevoPdf],
      }));

      setTempUploads((prev) => ({
        ...prev,
        pdfs: [...prev.pdfs, public_id],
      }));

      setPdfInputs((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("❌ Error al subir PDF:", err);
      alert("Error al subir el PDF.");
    }
  };

  const getVideoByLang = (lang) => {
    return (formData.videos || []).find(
      (v) => v._id && (v.url?.[lang] || true)
    );
  };

const videoId = formData.videoIds?.[0];
const video = formData[activeTab]?.videos?.find((v) => v._id === videoId);

 const addNewVideo = () => {
  const newId = uuidv4();

  setFormData((prev) => {
    const updated = { ...prev };

    // Agregamos un array global de IDs si no existe
    updated.videoIds = [...(prev.videoIds || []), newId];

    // Para cada idioma, nos aseguramos de que exista la entrada del video
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


  return (
    <form onSubmit={handleSubmit}>
      <div className="form-section">
        <label>Subtítulo:</label>
        <input
          type="text"
          value={formData.subtitle?.[activeTab] || ""}
          onChange={(e) => handleChange(e, "subtitle", activeTab)}
        />
      </div>

      <div className="form-section">
        <label>Contenido:</label>
        <textarea
          value={formData.content?.[activeTab] || ""}
          onChange={(e) => handleChange(e, "content", activeTab)}
        />
      </div>

      <div className="form-section">
        <label>Contenido secundario:</label>
        <textarea
          value={formData.secondaryContent?.[activeTab] || ""}
          onChange={(e) => handleChange(e, "secondaryContent", activeTab)}
        />
      </div>

      {/* PDFs */}
      <div className="form-section">
        <label>PDFs:</label>
        <button type="button" onClick={handleAddPdfInput}>
          ➕ Agregar PDF
        </button>

        {formData.pdfs?.map((pdf) =>
          pdf.url?.[activeTab] ? (
            <div key={pdf._id} className="pdf-file-card">
              <span className="pdf-icon">📄</span>
              <a href={pdf.url[activeTab]} target="_blank" rel="noreferrer">
                <span className="pdf-title">
                  {pdf.title?.[activeTab] || "Sin título"}
                </span>
              </a>
              <p className="pdf-description">
                {pdf.description?.[activeTab] || "Sin descripción"}
              </p>
              <button
                type="button"
                className="pdf-delete-button"
                onClick={async () => {
                  const publicId = pdf.public_id?.[activeTab];
                  if (publicId && tempUploads.pdfs.includes(publicId)) {
                    try {
                      await eliminarArchivoDesdeFrontend(publicId, "raw");
                    } catch (err) {
                      console.error("❌ Error al eliminar PDF:", err);
                    }
                  }

                  setFormData((prev) => ({
                    ...prev,
                    pdfs: prev.pdfs.filter((p) => p._id !== pdf._id),
                  }));
                }}
              >
                ❌
              </button>
            </div>
          ) : null
        )}

        {pdfInputs.map((pdf, i) => (
          <div key={pdf._id} className="nested-section pdf-upload-row">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handlePdfFileChange(i, e.target.files[0])}
            />
            <input
              type="text"
              placeholder="Título"
              value={pdf.title[activeTab]}
              onChange={(e) => handlePdfTextChange(i, "title", e.target.value)}
            />
            <input
              type="text"
              placeholder="Descripción"
              value={pdf.description[activeTab]}
              onChange={(e) =>
                handlePdfTextChange(i, "description", e.target.value)
              }
            />
            <button
              type="button"
              onClick={() => handleUploadPdfArchivo(i)}
              disabled={pdf.uploading}
            >
              {pdf.uploading ? "Subiendo..." : "📤 Subir PDF"}
            </button>
          </div>
        ))}
      </div>

      {/* Videos */}
      {/* Videos */}
      <div className="form-section">
        <label>Videos:</label>

        {!video?._id && (
          <button type="button" onClick={addNewVideo}>
            ➕ Agregar Video
          </button>
        )}

       {videoId && video && (
  <UploadVideoField
    activeLang={activeTab}
    video={video}
    onUploadSuccess={(videoPartial) => {
      setFormData((prev) => {
        const current = prev[activeTab]?.videos || [];

        const updated = current.map((v) =>
          v._id === videoPartial._id
            ? {
                ...v,
                url: { ...v.url, ...videoPartial.url },
                title: { ...v.title, ...videoPartial.title },
                description: { ...v.description, ...videoPartial.description },
              }
            : v
        );

        return {
          ...prev,
          [activeTab]: {
            ...(prev[activeTab] || {}),
            videos: updated,
          },
        };
      });
    }}
  />
)}
{formData.videoIds?.map((videoId) => {
  const video = formData[activeTab]?.videos?.find((v) => v._id === videoId);

  if (!video?.url?.[activeTab]) return null;

  return (
    <div key={videoId} className="nested-section uploaded-summary">
      <div>
        🎥 <strong>{video.title?.[activeTab] || "Sin título"}</strong>
        <p className="video-description">
          {video.description?.[activeTab] || "Sin descripción"}
        </p>
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            await eliminarVideoDeVimeo(video.url[activeTab]);
            setFormData((prev) => {
              const updated = { ...prev };
              updated[activeTab].videos = updated[activeTab].videos.filter(
                (v) => v._id !== videoId
              );
              updated.videoIds = updated.videoIds.filter((id) => id !== videoId);
              return updated;
            });
          } catch (err) {
            alert("Error al eliminar video.");
          }
        }}
      >
        ❌
      </button>
    </div>
  );
})}

      </div>

      {/* Botones */}
      <div className="form-buttons">
        <button type="submit">💾 Guardar</button>
        <button type="button" onClick={onCancel}>
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default CourseClassForm;
