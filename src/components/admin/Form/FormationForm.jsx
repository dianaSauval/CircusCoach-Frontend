const FormationForm = ({ formData, setFormData, activeTab }) => {
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
        onChange={(e) =>
          setFormData({ ...formData, price: e.target.value })
        }
        placeholder="Precio"
      />

      {/* 🔹 Imagen por idioma */}
      <label>URL de la imagen ({activeTab.toUpperCase()})</label>
      <input
        type="text"
        name="image"
        value={formData?.image?.[activeTab] || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            image: { ...formData.image, [activeTab]: e.target.value },
          })
        }
        placeholder="https://example.com/imagen.jpg"
      />

      {/* 🔹 PDF por idioma */}
      <label>URL del PDF ({activeTab.toUpperCase()})</label>
      <input
        type="text"
        name="pdf"
        value={formData?.pdf?.[activeTab] || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            pdf: { ...formData.pdf, [activeTab]: e.target.value },
          })
        }
        placeholder="https://example.com/info.pdf"
      />

      {/* 🔹 Video por idioma */}
      <label>URL del video ({activeTab.toUpperCase()})</label>
      <input
        type="text"
        name="video"
        value={formData?.video?.[activeTab] || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            video: { ...formData.video, [activeTab]: e.target.value },
          })
        }
        placeholder="https://youtube.com/..."
      />
    </>
  );
};

export default FormationForm;
