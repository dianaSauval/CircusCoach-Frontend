import { useEffect, useState } from "react";
import "./CourseForm.css";
import UploadVideoField from "../UploadVideoField/UploadVideoField";
import { v4 as uuidv4 } from "uuid";
import {
  eliminarVideoDeVimeo,
  subirVideoAVimeo,
} from "../../../services/uploadVimeoService";
import {
  eliminarArchivoDesdeFrontend,
  subirPdfPrivado,
  subirPdfPublico,
} from "../../../services/uploadCloudinary";
import VideoPromocionalForm from "../VideoPromocionalForm/VideoPromocionalForm";

const CourseForm = ({ initialData, isClass, onCancel, onSave, activeTab }) => {
  const [formData, setFormData] = useState({ ...initialData });
  const [tempUploads, setTempUploads] = useState({ pdfs: [], videos: [] });
  const [pdfInputs, setPdfInputs] = useState([]);

  useEffect(() => {
    if (!isClass) {
      setFormData((prev) => {
        const fixed = { ...prev };
        ["es", "en", "fr"].forEach((lang) => {
          if (typeof fixed.pdf?.[lang] === "object") {
            fixed.pdf[lang] = fixed.pdf[lang]?.url || "";
          }
          if (typeof fixed.video?.[lang] === "object") {
            fixed.video[lang] = fixed.video[lang]?.url || "";
          }
        });
        return fixed;
      });
    }
  }, [isClass]);

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

  const handleCancel = async () => {
    // Eliminar PDFs nuevos
    for (let public_id of tempUploads.pdfs) {
      try {
        await eliminarArchivoDesdeFrontend(public_id, "raw");
      } catch (err) {
        console.error("Error al eliminar PDF temporal:", err);
      }
    }
    // Eliminar Videos nuevos
    for (let url of tempUploads.videos) {
      try {
        await eliminarVideoDeVimeo(url);
      } catch (err) {
        console.error("Error al eliminar video temporal:", err);
      }
    }
    onCancel();
  };

  const prepareDataForSave = (data) => {
    const cleaned = {
      title: data.title,
      visible: data.visible,
    };

    if (isClass) {
      cleaned.subtitle = data.subtitle;
      cleaned.content = data.content;
      cleaned.secondaryContent = data.secondaryContent;

      cleaned.pdfs = (data.pdfs || []).map((pdf) => ({
        _id: pdf._id || uuidv4(),
        url: {
          es: pdf.url?.es || "",
          en: pdf.url?.en || "",
          fr: pdf.url?.fr || "",
        },
        title: {
          es: pdf.title?.es || "",
          en: pdf.title?.en || "",
          fr: pdf.title?.fr || "",
        },
        description: {
          es: pdf.description?.es || "",
          en: pdf.description?.en || "",
          fr: pdf.description?.fr || "",
        },
        public_id: {
          es: pdf.public_id?.es || "",
          en: pdf.public_id?.en || "",
          fr: pdf.public_id?.fr || "",
        },
      }));

      cleaned.videos = (data.videos || []).map((video) => ({
        _id: video._id || uuidv4(),
        url: {
          es: video.url?.es || "",
          en: video.url?.en || "",
          fr: video.url?.fr || "",
        },
        title: {
          es: video.title?.es || "",
          en: video.title?.en || "",
          fr: video.title?.fr || "",
        },
        description: {
          es: video.description?.es || "",
          en: video.description?.en || "",
          fr: video.description?.fr || "",
        },
      }));
    } else {
      cleaned.description = data.description?.es
        ? data.description
        : { es: data.description || "", en: "", fr: "" };
      cleaned.image = data.image?.es
        ? data.image
        : { es: data.image || "", en: "", fr: "" };
      cleaned.price = Number(data.price);

      cleaned.pdf = { es: "", en: "", fr: "" };
      cleaned.public_id_pdf = { es: "", en: "", fr: "" };
      cleaned.video = { es: "", en: "", fr: "" };

      ["es", "en", "fr"].forEach((lang) => {
        cleaned.pdf[lang] = data.pdf?.[lang] || "";
        cleaned.public_id_pdf[lang] = data.public_id_pdf?.[lang] || "";
        cleaned.video[lang] = data.video?.[lang] || "";
      });
    }

    return cleaned;
  };

  const handleUploadPdfCurso = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const { url, public_id } = await subirPdfPublico(file);
        setFormData((prev) => ({
          ...prev,
          pdf: { ...prev.pdf, [activeTab]: url },
          public_id_pdf: { ...prev.public_id_pdf, [activeTab]: public_id },
        }));
        setTempUploads((prev) => ({
          ...prev,
          pdfs: [...prev.pdfs, public_id],
        }));
      } catch (err) {
        console.error("❌ Error al subir PDF público:", err);
        alert("Hubo un error al subir el PDF. Intenta nuevamente.");
      }
    };
  };

  const handleChange = (e, field, lang) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const handleSimpleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: [
        ...(prev[type] || []),
        {
          _id: uuidv4(),
          url: { es: "", en: "", fr: "" },
          public_id: { es: "", en: "", fr: "" },
          title: { es: "", en: "", fr: "" },
          description: { es: "", en: "", fr: "" },
        },
      ],
    }));
  };

  const handleNestedChange = (type, index, lang, field, value) => {
    const items = [...formData[type]];
    items[index][field][lang] = value;
    setFormData((prev) => ({ ...prev, [type]: items }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = prepareDataForSave(formData);
    onSave(cleanedData);
  };

  const handleAddUploadedVideo = (videoObj) => {
    const newVideo = {
      _id: uuidv4(),
      url: { es: "", en: "", fr: "" },
      title: { es: "", en: "", fr: "" },
      description: { es: "", en: "", fr: "" },
    };

    // Solo guardamos en el idioma activo
    newVideo.url[activeTab] = videoObj.url || "";
    newVideo.title[activeTab] = videoObj.title || "";
    newVideo.description[activeTab] = videoObj.description || "";

    // Agregamos a formData
    setFormData((prev) => ({
      ...prev,
      videos: [...(prev.videos || []), newVideo],
    }));

    // Guardamos la URL temporal para eliminarla si se cancela
    setTempUploads((prev) => ({
      ...prev,
      videos: [...prev.videos, videoObj.url],
    }));
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

  const handlePdfFileChange = (index, file) => {
    const updated = [...pdfInputs];
    updated[index].file = file;
    setPdfInputs(updated);
  };

  const handlePdfTextChange = (index, field, value) => {
    const updated = [...pdfInputs];
    updated[index][field][activeTab] = value;
    setPdfInputs(updated);
  };

  return (
    <form className="course-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <label>Título:</label>
        <input
          type="text"
          value={formData.title?.[activeTab] || ""}
          onChange={(e) => handleChange(e, "title", activeTab)}
          required
        />
      </div>

      {isClass ? (
        <>
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

          <div className="form-section">
            <label>PDFs:</label>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <button type="button" onClick={handleAddPdfInput}>
                ➕ Agregar PDF
              </button>
            </div>

            {/* PDFs ya subidos */}
            {formData.pdfs
  ?.filter((pdf) => pdf.url?.[activeTab]?.trim())
  .map((pdf, i) => (
    <div key={pdf._id} className="pdf-file-card">
      <span className="pdf-icon">📄</span>
      <a href={pdf.url[activeTab]} target="_blank" rel="noreferrer">
        <span className="pdf-title">{pdf.title?.[activeTab] || "Sin título"}</span>
      </a>
      <p className="pdf-description">
        {pdf.description?.[activeTab] || "Sin descripción"}
      </p>
      <button
        type="button"
        className="pdf-delete-button"
        onClick={async () => {
          const publicId = pdf.public_id?.[activeTab];
          if (publicId) {
            try {
              if (tempUploads.pdfs.includes(publicId)) {
                await eliminarArchivoDesdeFrontend(publicId, "raw");
              }
              console.log("✅ PDF eliminado de Cloudinary");
            } catch (err) {
              console.error("❌ Error al eliminar PDF:", err);
              alert("Hubo un error al eliminar el PDF de Cloudinary.");
            }
          }

          const updated = formData.pdfs.filter((p) => p._id !== pdf._id);
          setFormData((prev) => ({ ...prev, pdfs: updated }));
        }}
      >
        ❌
      </button>
    </div>
  ))}


            {/* PDFs nuevos aún no subidos */}
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
                  onChange={(e) =>
                    handlePdfTextChange(i, "title", e.target.value)
                  }
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

          <div className="form-section">
            <label>Videos:</label>
            <UploadVideoField
              activeLang={activeTab}
              onUploadSuccess={handleAddUploadedVideo}
            />
            {formData.videos
              ?.filter((video) => video.url?.[activeTab])
              .map((video, i) => (
                <div
                  key={i}
                  className="nested-section uploaded-summary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <div>
                    🎥{" "}
                    <strong>
                      {typeof video.title?.[activeTab] === "string"
                        ? video.title[activeTab]
                        : "Sin título"}
                    </strong>
                    <p className="video-description">
                      {typeof video.description?.[activeTab] === "string"
                        ? video.description[activeTab]
                        : "Sin descripción"}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="remove-btn"
                    onClick={async () => {
                      const videoUrl = video.url?.[activeTab];
                      if (!videoUrl) return;

                      try {
                        await eliminarVideoDeVimeo(videoUrl);
                        console.log("✅ Video eliminado de Vimeo");

                        const updated = formData.videos.filter(
                          (v) => v._id !== video._id
                        );
                        setFormData((prev) => ({ ...prev, videos: updated }));
                      } catch (err) {
                        console.error("❌ Error al eliminar video:", err);
                        alert(
                          "Hubo un error al eliminar el video. Intenta nuevamente."
                        );
                      }
                    }}
                  >
                    ❌
                  </button>
                </div>
              ))}
          </div>
        </>
      ) : (
        <>
          <div className="form-section">
            <label>Descripción:</label>
            <textarea
              value={formData.description?.[activeTab] || ""}
              onChange={(e) => handleChange(e, "description", activeTab)}
            />
          </div>

          <div className="form-section">
            <label>Precio:</label>
            <input
              type="number"
              name="price"
              value={formData.price || ""}
              onChange={handleSimpleChange}
            />
          </div>

          <div className="form-section">
            <div className="form-section">
              <label>PDF de presentación (URL):</label>
              {formData.pdf?.[activeTab] ? (
                <div className="nested-section uploaded-summary">
                  <p>
                    ✅ PDF subido:{" "}
                    <a
                      href={formData.pdf[activeTab]}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver archivo
                    </a>
                  </p>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={async () => {
                      const publicId = formData.public_id_pdf?.[activeTab];
                      if (publicId) {
                        try {
                          await eliminarArchivoDesdeFrontend(publicId, "raw");
                          setFormData((prev) => ({
                            ...prev,
                            pdf: { ...prev.pdf, [activeTab]: "" },
                            public_id_pdf: {
                              ...prev.public_id_pdf,
                              [activeTab]: "",
                            },
                          }));
                          setTempUploads((prev) => ({
                            ...prev,
                            pdfs: prev.pdfs.filter((id) => id !== publicId),
                          }));
                        } catch (err) {
                          console.error("❌ Error al eliminar PDF:", err);
                          alert("Error al eliminar el PDF.");
                        }
                      }
                    }}
                  >
                    ❌ Eliminar PDF
                  </button>
                </div>
              ) : (
                <button type="button" onClick={handleUploadPdfCurso}>
                  📤 Subir archivo PDF
                </button>
              )}
            </div>

            <div className="form-section">
              <label style={{ fontWeight: "bold" }}>
                🎞️ Video promocional:
              </label>
              <VideoPromocionalForm
                formData={formData}
                setFormData={setFormData}
                activeTab={activeTab}
                onAddTempVideo={(url) =>
                  setTempUploads((prev) => ({
                    ...prev,
                    videos: [...prev.videos, url],
                  }))
                }
              />
            </div>
          </div>
        </>
      )}

      <div className="form-buttons">
        <button type="submit">💾 Guardar</button>
        <button type="button" onClick={handleCancel}>
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
