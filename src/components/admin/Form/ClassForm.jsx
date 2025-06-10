import "./Form.css";

const ClassForm = ({ formData, setFormData, activeTab }) => {
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

  // 📄 PDF handlers (estructura multilenguaje)
  const handlePdfChange = (index, field, value) => {
    const updated = [...(formData.pdfs || [])];
    updated[index] = {
      ...updated[index],
      [field]: {
        ...(updated[index]?.[field] || {}),
        [activeTab]: value,
      },
    };
    setFormData({ ...formData, pdfs: updated });
  };

  const addPdf = () => {
    setFormData({
      ...formData,
      pdfs: [
        ...(formData.pdfs || []),
        {
          title: { es: "", en: "", fr: "" },
          description: { es: "", en: "", fr: "" },
          url: { es: "", en: "", fr: "" },
        },
      ],
    });
  };

  const removePdf = (index) => {
    const updated = [...(formData.pdfs || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, pdfs: updated });
  };

  // 🎥 Video handlers (estructura multilenguaje)
  const handleVideoChange = (index, field, value) => {
    const updated = [...(formData.videos || [])];
    updated[index] = {
      ...updated[index],
      [field]: {
        ...(updated[index]?.[field] || {}),
        [activeTab]: value,
      },
    };
    setFormData({ ...formData, videos: updated });
  };

  const addVideo = () => {
    setFormData({
      ...formData,
      videos: [
        ...(formData.videos || []),
        {
          title: { es: "", en: "", fr: "" },
          description: { es: "", en: "", fr: "" },
          url: { es: "", en: "", fr: "" },
        },
      ],
    });
  };

  const removeVideo = (index) => {
    const updated = [...(formData.videos || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, videos: updated });
  };

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
      {Array.isArray(formData.pdfs) ? (
        formData.pdfs.map((pdf, index) => (
          <div key={index} className="pdf-block">
            <div className="input-group">
              <label>Título del PDF</label>
              <input
                type="text"
                value={pdf.title?.[activeTab] || ""}
                onChange={(e) => handlePdfChange(index, "title", e.target.value)}
                placeholder="Título"
              />
            </div>
            <div className="input-group">
              <label>Descripción del PDF</label>
              <textarea
                value={pdf.description?.[activeTab] || ""}
                onChange={(e) => handlePdfChange(index, "description", e.target.value)}
                placeholder="Descripción"
              />
            </div>
            <div className="input-group">
              <label>URL del PDF</label>
              <input
                type="text"
                value={pdf.url?.[activeTab] || ""}
                onChange={(e) => handlePdfChange(index, "url", e.target.value)}
                placeholder="URL"
              />
            </div>
            <button onClick={() => removePdf(index)}>🗑️ Quitar PDF</button>
          </div>
        ))
      ) : null}
      <button onClick={addPdf}>➕ Agregar PDF</button>

      <h3>🎥 Videos</h3>
      {Array.isArray(formData.videos) ? (
        formData.videos.map((video, index) => (
          <div key={index} className="video-block">
            <div className="input-group">
              <label>Título del Video</label>
              <input
                type="text"
                value={video.title?.[activeTab] || ""}
                onChange={(e) => handleVideoChange(index, "title", e.target.value)}
                placeholder="Título"
              />
            </div>
            <div className="input-group">
              <label>Descripción del Video</label>
              <textarea
                value={video.description?.[activeTab] || ""}
                onChange={(e) => handleVideoChange(index, "description", e.target.value)}
                placeholder="Descripción"
              />
            </div>
            <div className="input-group">
              <label>URL del Video</label>
              <input
                type="text"
                value={video.url?.[activeTab] || ""}
                onChange={(e) => handleVideoChange(index, "url", e.target.value)}
                placeholder="URL"
              />
            </div>
            <button onClick={() => removeVideo(index)}>🗑️ Quitar Video</button>
          </div>
        ))
      ) : null}
      <button onClick={addVideo}>➕ Agregar Video</button>
    </div>
  );
};

export default ClassForm;
