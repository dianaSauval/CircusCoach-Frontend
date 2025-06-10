import { useState } from "react";
import "./AddItemModal.css";
import {
  createClass,
  createFormation,
  createModule,
} from "../../../services/formationService";

const AddItemModal = ({ type, parentId, closeModal, onAdd }) => {
  const [activeTab, setActiveTab] = useState("es");
  const isFormation = type === "formation";
  const isClass = type === "class";

  const initialState = {
    title: { es: "", en: "", fr: "" },
    description: { es: "", en: "", fr: "" },
    ...(isFormation && {
      price: "",
      image: { es: "", en: "", fr: "" },
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
        es: [{ url: "", title: "", description: "" }],
        en: [{ url: "", title: "", description: "" }],
        fr: [{ url: "", title: "", description: "" }],
      },
    }),
  };

  const [formData, setFormData] = useState(initialState);

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
          pdf: formData.pdf,
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
        const transformToMultiLang = (items) =>
          items.map((item) => ({
            url: { es: "", en: "", fr: "", [activeTab]: item.url },
            title: { es: "", en: "", fr: "", [activeTab]: item.title },
            description: {
              es: "",
              en: "",
              fr: "",
              [activeTab]: item.description,
            },
          }));

        payload = {
          title: formData.title,
          subtitle: formData.subtitle,
          content: formData.description,
          secondaryContent: formData.secondaryContent,
          pdfs: transformToMultiLang(formData.pdfs[activeTab]),
          videos: transformToMultiLang(formData.videos[activeTab]),
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

  const handlePdfChange = (index, e) => {
    const updated = [...formData.pdfs[activeTab]];
    updated[index][e.target.name] = e.target.value;
    setFormData((prev) => ({
      ...prev,
      pdfs: { ...prev.pdfs, [activeTab]: updated },
    }));
  };

  const addPdf = () => {
    setFormData((prev) => ({
      ...prev,
      pdfs: {
        ...prev.pdfs,
        [activeTab]: [
          ...prev.pdfs[activeTab],
          { url: "", title: "", description: "" },
        ],
      },
    }));
  };

  const removePdf = (index) => {
    const updated = [...formData.pdfs[activeTab]];
    updated.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      pdfs: { ...prev.pdfs, [activeTab]: updated },
    }));
  };

  const handleVideoChange = (index, e) => {
    const updated = [...formData.videos[activeTab]];
    updated[index][e.target.name] = e.target.value;
    setFormData((prev) => ({
      ...prev,
      videos: { ...prev.videos, [activeTab]: updated },
    }));
  };

  const addVideo = () => {
    setFormData((prev) => ({
      ...prev,
      videos: {
        ...prev.videos,
        [activeTab]: [
          ...prev.videos[activeTab],
          { url: "", title: "", description: "" },
        ],
      },
    }));
  };

  const removeVideo = (index) => {
    const updated = [...formData.videos[activeTab]];
    updated.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      videos: { ...prev.videos, [activeTab]: updated },
    }));
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

          {type === "class" && (
            <>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle[activeTab]}
                onChange={handleChange}
                placeholder={`Subtítulo (${activeTab.toUpperCase()})`}
              />
              <textarea
                name="secondaryContent"
                value={formData.secondaryContent[activeTab]}
                onChange={handleChange}
                placeholder={`Contenido Secundario (${activeTab.toUpperCase()})`}
              />

              <h3>📄 PDFs</h3>
              {formData.pdfs[activeTab].map((pdf, index) => (
                <div key={index} className="pdf-block">
                  <input
                    type="text"
                    name="url"
                    value={pdf.url}
                    onChange={(e) => handlePdfChange(index, e)}
                    placeholder="URL del PDF"
                  />
                  <input
                    type="text"
                    name="title"
                    value={pdf.title}
                    onChange={(e) => handlePdfChange(index, e)}
                    placeholder="Título del PDF"
                  />
                  <input
                    type="text"
                    name="description"
                    value={pdf.description}
                    onChange={(e) => handlePdfChange(index, e)}
                    placeholder="Descripción del PDF"
                  />
                  <button type="button" onClick={() => removePdf(index)}>
                    ❌ Eliminar PDF
                  </button>
                </div>
              ))}
              <button type="button" onClick={addPdf}>
                ➕ Agregar PDF
              </button>

              <h3>🎥 Videos</h3>
              {formData.videos[activeTab].map((video, index) => (
                <div key={index} className="video-block">
                  <input
                    type="text"
                    name="url"
                    value={video.url}
                    onChange={(e) => handleVideoChange(index, e)}
                    placeholder="URL del Video"
                  />
                  <input
                    type="text"
                    name="title"
                    value={video.title}
                    onChange={(e) => handleVideoChange(index, e)}
                    placeholder="Título del Video"
                  />
                  <input
                    type="text"
                    name="description"
                    value={video.description}
                    onChange={(e) => handleVideoChange(index, e)}
                    placeholder="Descripción del Video"
                  />
                  <button type="button" onClick={() => removeVideo(index)}>
                    ❌ Eliminar Video
                  </button>
                </div>
              ))}
              <button type="button" onClick={addVideo}>
                ➕ Agregar Video
              </button>
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
              <input
                type="text"
                name="image"
                value={formData.image[activeTab]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    image: { ...formData.image, [activeTab]: e.target.value },
                  })
                }
                placeholder={`URL de imagen (${activeTab.toUpperCase()})`}
              />

              <h3>📄 PDF</h3>
              <input
                type="text"
                name="pdf"
                value={formData.pdf[activeTab]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pdf: { ...formData.pdf, [activeTab]: e.target.value },
                  })
                }
                placeholder={`URL del PDF (${activeTab.toUpperCase()})`}
              />

              <h3>🎥 Video</h3>
              <input
                type="text"
                name="video"
                value={formData.video[activeTab]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    video: { ...formData.video, [activeTab]: e.target.value },
                  })
                }
                placeholder={`URL del Video (${activeTab.toUpperCase()})`}
              />
            </>
          )}
          <div className="content-button-modal">
            <button type="submit">✅ Agregar</button>
            <button type="button" onClick={closeModal}>
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
