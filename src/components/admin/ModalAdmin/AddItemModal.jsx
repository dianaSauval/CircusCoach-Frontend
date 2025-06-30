import { useState } from "react";
import "./AddItemModal.css";
import {
  createClass,
  createFormation,
  createModule,
} from "../../../services/formationService";
import UploadImagenField from "../../common/UploadImagenField/UploadImagenField";
import { eliminarArchivoDesdeFrontend } from "../../../services/uploadCloudinary";
import UploadPdfPublicoField from "../../common/UploadPdfPublicoField/UploadPdfPublicoField";
import VideoPromocionalForm from "../../common/VideoPromocionalForm/VideoPromocionalForm";
import { eliminarVideoDeVimeo } from "../../../services/uploadVimeoService";
import UploadPdfPrivadoField from "../../common/UploadPdfPrivadoField/UploadPdfPrivadoField";
import UploadVideoField from "../../common/UploadVideoField/UploadVideoField";

const AddItemModal = ({ type, parentId, closeModal, onAdd }) => {
  const [activeTab, setActiveTab] = useState("es");
  const [pdfUrl, setPdfUrl] = useState({ es: null, en: null, fr: null });
  const [pdfPublicId, setPdfPublicId] = useState({ es: "", en: "", fr: "" });
  const [tempPdfPublicIds, setTempPdfPublicIds] = useState([]);
  const [tempVideoUrls, setTempVideoUrls] = useState([]);
  const [tempPdfPrivadosPublicIds, setTempPdfPrivadosPublicIds] = useState([]);

  const isFormation = type === "formation";
  const isClass = type === "class";

  const initialState = {
    title: { es: "", en: "", fr: "" },
    description: { es: "", en: "", fr: "" },
    ...(isFormation && {
      price: "",
      image: { es: "", en: "", fr: "" },
      image_public_id: { es: "", en: "", fr: "" },
      pdf: { es: "", en: "", fr: "" },
      video: { es: "", en: "", fr: "" },
    }),
    ...(isClass && {
      subtitle: { es: "", en: "", fr: "" },
      secondaryContent: { es: "", en: "", fr: "" },
      pdfs: {
        es: [{ url: "", title: "", description: "" }],
        en: [{ url: "", title: "", description: "" }],
        fr: [{ url: "", title: "", description: "" }],
      },
      videos: {
        es: [],
        en: [],
        fr: [],
      },
    }),
  };

  const [formData, setFormData] = useState(initialState); // para formations y módulos
  const [formDataClass, setFormDataClass] = useState({
    title: { es: "", en: "", fr: "" },
    subtitle: { es: "", en: "", fr: "" },
    content: { es: "", en: "", fr: "" },
    secondaryContent: { es: "", en: "", fr: "" },
    visible: { es: false, en: false, fr: false },
    pdfs: {
      es: [],
      en: [],
      fr: [],
    },
    videos: {
      es: [],
      en: [],
      fr: [],
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: { ...prev[name], [activeTab]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = {};

      if (type === "formation") {
        payload = {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          image: formData.image,
          pdf: {
            es: pdfUrl.es?.url || "",
            en: pdfUrl.en?.url || "",
            fr: pdfUrl.fr?.url || "",
          },
          video: formData.video,
        };
      } else if (type === "module") {
        payload = {
          title: formData.title,
          description: formData.description,
          formationId: parentId,
        };
      } else if (type === "class") {
        // 🔧 Transformar PDF y Video para que tengan estructura multilanguage
        // Garantiza que las propiedades estén definidas como arrays vacíos
        ["es", "en", "fr"].forEach((lang) => {
          if (!Array.isArray(formDataClass.pdfs?.[lang])) {
            formDataClass.pdfs[lang] = [];
          }
          if (!Array.isArray(formDataClass.videos?.[lang])) {
            formDataClass.videos[lang] = [];
          }
        });

        const pdfs = [];
        const videos = [];

        ["es", "en", "fr"].forEach((lang) => {
          (formDataClass.pdfs?.[lang] || []).forEach((pdf) => {
            let existing = pdfs.find((p) => p._id === pdf._id);
            if (!existing) {
              existing = {
                _id: pdf._id,
                url: { es: "", en: "", fr: "" },
                title: { es: "", en: "", fr: "" },
                description: { es: "", en: "", fr: "" },
              };
              pdfs.push(existing);
            }
            existing.url[lang] =
              typeof pdf.url === "string" ? pdf.url : pdf.url?.[lang] || "";
            existing.title[lang] =
              typeof pdf.title === "string"
                ? pdf.title
                : pdf.title?.[lang] || "";
            existing.description[lang] =
              typeof pdf.description === "string"
                ? pdf.description
                : pdf.description?.[lang] || "";
          });

          (formDataClass.videos?.[lang] || []).forEach((video) => {
            let existing = videos.find((v) => v._id === video._id);
            if (!existing) {
              existing = {
                _id: video._id,
                url: { es: "", en: "", fr: "" },
                title: { es: "", en: "", fr: "" },
                description: { es: "", en: "", fr: "" },
              };
              videos.push(existing);
            }
            existing.url[lang] =
              typeof video.url === "string"
                ? video.url
                : video.url?.[lang] || "";
            existing.title[lang] =
              typeof video.title === "string"
                ? video.title
                : video.title?.[lang] || "";
            existing.description[lang] =
              typeof video.description === "string"
                ? video.description
                : video.description?.[lang] || "";
          });
        });

        payload = {
          title: formDataClass.title,
          subtitle: formDataClass.subtitle,
          content: formDataClass.content,
          secondaryContent: formDataClass.secondaryContent,
          visible: formDataClass.visible,
          pdfs,
          videos,
          moduleId: parentId,
        };
      }

      const handlers = {
        formation: createFormation,
        module: createModule,
        class: createClass,
      };

      const response = await handlers[type](payload);
      onAdd(response.data);
      closeModal();
    } catch (error) {
      console.error(
        "❌ Error al agregar:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>
          Agregar{" "}
          {type === "formation"
            ? "Formación"
            : type === "module"
            ? "Módulo"
            : "Clase"}
        </h2>

        {/* 🔹 Pestañas de idioma */}
        <div className="language-tabs">
          {["es", "en", "fr"].map((lang) => (
            <button
              key={lang}
              className={activeTab === lang ? "active" : ""}
              onClick={() => setActiveTab(lang)}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          {/* Título y descripción general SOLO si no es una clase */}
          {(type === "formation" || type === "module") && (
            <>
              <input
                type="text"
                name="title"
                value={formData.title[activeTab]}
                onChange={handleChange}
                placeholder={`Título (${activeTab.toUpperCase()})`}
                required
              />
              <textarea
                name="description"
                value={formData.description[activeTab]}
                onChange={handleChange}
                placeholder={`Descripción (${activeTab.toUpperCase()})`}
              />
            </>
          )}

          {type === "class" && (
            <>
              {/* Input de título solo para clases (no duplicado) */}
              <input
                type="text"
                name="title"
                value={formDataClass.title[activeTab]}
                onChange={(e) =>
                  setFormDataClass((prev) => ({
                    ...prev,
                    title: { ...prev.title, [activeTab]: e.target.value },
                  }))
                }
                placeholder={`Título (${activeTab.toUpperCase()})`}
                required
              />

              <textarea
                name="content"
                value={formDataClass.content[activeTab]}
                placeholder={`Contenido principal (${activeTab.toUpperCase()})`}
                onChange={(e) =>
                  setFormDataClass((prev) => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      [activeTab]: e.target.value,
                    },
                  }))
                }
              />

              <input
                type="text"
                name="subtitle"
                value={formDataClass.subtitle[activeTab]}
                placeholder={`Subtítulo (${activeTab.toUpperCase()})`}
                onChange={(e) =>
                  setFormDataClass((prev) => ({
                    ...prev,
                    subtitle: { ...prev.subtitle, [activeTab]: e.target.value },
                  }))
                }
              />

              <textarea
                name="secondaryContent"
                value={formDataClass.secondaryContent[activeTab]}
                placeholder={`Descripción (${activeTab.toUpperCase()})`}
                onChange={(e) =>
                  setFormDataClass((prev) => ({
                    ...prev,
                    secondaryContent: {
                      ...prev.secondaryContent,
                      [activeTab]: e.target.value,
                    },
                  }))
                }
              />

              <h3>📄 PDFs</h3>
              <UploadPdfPrivadoField
                activeTab={activeTab}
                existingPdfs={formDataClass.pdfs?.[activeTab] || []}
                setPdfs={(list) =>
                  setFormDataClass((prev) => {
                    const pdfsSeguros = {
                      es: prev.pdfs?.es || [],
                      en: prev.pdfs?.en || [],
                      fr: prev.pdfs?.fr || [],
                    };

                    return {
                      ...prev,
                      pdfs: {
                        ...pdfsSeguros,
                        [activeTab]: list,
                      },
                    };
                  })
                }
                onPdfUploaded={(pdf) =>
                  setFormDataClass((prev) => {
                    const currentPdfs = prev.pdfs?.[activeTab];
                    const safeArray = Array.isArray(currentPdfs)
                      ? currentPdfs
                      : [];

                    return {
                      ...prev,
                      pdfs: {
                        ...prev.pdfs,
                        [activeTab]: [...safeArray, pdf],
                      },
                    };
                  })
                }
                onTempPublicId={(id) =>
                  setTempPdfPrivadosPublicIds((prev) => [...prev, id])
                }
              />

              <h3>🎥 Videos</h3>
              <UploadVideoField
                activeLang={activeTab}
                videos={formDataClass.videos?.[activeTab] || []}
                onChange={(list) =>
                  setFormDataClass((prev) => ({
                    ...prev,
                    videos: {
                      ...prev.videos,
                      [activeTab]: list,
                    },
                  }))
                }
                onTempUpload={(url) =>
                  setTempVideoUrls((prev) =>
                    prev.includes(url) ? prev : [...prev, url]
                  )
                }
              />
            </>
          )}

          {type === "formation" && (
            <>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="Precio"
                required
              />
              <label>📷 URL de imagen</label>
              <UploadImagenField
                activeLang={activeTab}
                value={formData.image[activeTab]}
                onChange={(url, publicId) =>
                  setFormData((prev) => ({
                    ...prev,
                    image: { ...prev.image, [activeTab]: url },
                    image_public_id: {
                      ...prev.image_public_id,
                      [activeTab]: publicId,
                    },
                  }))
                }
              />

              <h3>📄 PDF</h3>
              <UploadPdfPublicoField
                activeLang={activeTab}
                pdfUrl={pdfUrl}
                setPdfUrl={setPdfUrl}
                publicId={pdfPublicId}
                setPublicId={setPdfPublicId}
                onTempUpload={(id) =>
                  setTempPdfPublicIds((prev) => [...prev, id])
                }
              />

              <h3>🎥 Video</h3>
              <VideoPromocionalForm
                formData={formData}
                setFormData={setFormData}
                activeTab={activeTab}
                onAddTempVideo={(url) => {
                  if (!tempVideoUrls.includes(url)) {
                    setTempVideoUrls((prev) => [...prev, url]);
                  }
                }}
              />
            </>
          )}

          <div className="content-button-modal">
            <button type="submit">✅ Agregar</button>
            <button
              type="button"
              onClick={async () => {
                const imageId = formData.image_public_id?.[activeTab];
                if (imageId) {
                  try {
                    await eliminarArchivoDesdeFrontend(imageId, "image");
                    console.log("🗑 Imagen eliminada de Cloudinary al cancelar");
                  } catch (err) {
                    console.warn(
                      "⚠️ No se pudo eliminar la imagen al cancelar:",
                      err.message
                    );
                  }
                }

                for (const id of tempPdfPublicIds) {
                  try {
                    await eliminarArchivoDesdeFrontend(id, "raw");
                    console.log(
                      `🗑 PDF con public_id ${id} eliminado correctamente`
                    );
                  } catch (err) {
                    console.warn(
                      `⚠️ No se pudo eliminar el PDF ${id}:`,
                      err.message
                    );
                  }
                }

                for (const id of tempPdfPrivadosPublicIds) {
                  try {
                    await eliminarArchivoDesdeFrontend(id, "raw");
                    console.log(`🗑 PDF privado ${id} eliminado correctamente`);
                  } catch (err) {
                    console.warn(
                      `⚠️ No se pudo eliminar el PDF privado ${id}:`,
                      err.message
                    );
                  }
                }

                for (const url of tempVideoUrls) {
                  try {
                    await eliminarVideoDeVimeo(url);
                    console.log("🗑 Video temporal eliminado de Vimeo:", url);
                  } catch (err) {
                    console.warn(
                      "⚠️ No se pudo eliminar el video temporal:",
                      err.message
                    );
                  }
                }

                closeModal();
              }}
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
