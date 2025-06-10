// components/admin/Form/PresentialFormationForm.jsx
import { useState } from "react";
import LanguageTabs from "../LanguageTabs/LanguageTabs";
import "./CourseForm.css";

const PresentialFormationForm = ({
  initialData = {},
  onSave,
  onCancel,
  activeTab,
  setActiveTab,
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || { es: "", en: "", fr: "" },
    description: initialData.description || { es: "", en: "", fr: "" },
    location: initialData.location || { es: "", en: "", fr: "" },
    dateType: initialData.dateType || "single",
    singleDate: initialData.singleDate
      ? initialData.singleDate.slice(0, 10)
      : "",
    dateRange: {
      start: initialData.dateRange?.start?.slice(0, 10) || "",
      end: initialData.dateRange?.end?.slice(0, 10) || "",
    },
    time: initialData.time || "",
    registrationLink: initialData.registrationLink || "",
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");



  const handleChange = (field, value, lang = null) => {
    setFormData((prev) => {
      if (lang) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [lang]: value,
          },
        };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const newErrors = {};
    let missingLanguages = [];
  
    ["es", "en", "fr"].forEach((lang) => {
      if (!formData.title[lang]) {
        newErrors[`title-${lang}`] = "El título es obligatorio";
        if (lang !== activeTab) missingLanguages.push(lang);
      }
      if (!formData.description[lang]) {
        newErrors[`description-${lang}`] = "La descripción es obligatoria";
        if (lang !== activeTab) missingLanguages.push(lang);
      }
      if (!formData.location[lang]) {
        newErrors[`location-${lang}`] = "La ubicación es obligatoria";
        if (lang !== activeTab) missingLanguages.push(lang);
      }
    });
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
  
      if (missingLanguages.length > 0) {
        const langs = [...new Set(missingLanguages)].map((l) =>
          l === "en" ? "inglés" : l === "fr" ? "francés" : l
        );
        setGlobalError(`Falta completar la información en: ${langs.join(", ")}`);
      } else {
        setGlobalError("");
      }
      
  
      return;
    }
  
    setErrors({});
    setGlobalError("");
    onSave(formData);
  };
  

  return (
    <form onSubmit={handleSubmit} className="presential-form">
      <LanguageTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {globalError && (
  <div className="global-error">{globalError}</div>
)}
      <input
        type="text"
        placeholder={`Título (${activeTab})`}
        value={formData.title[activeTab]}
        onChange={(e) => handleChange("title", e.target.value, activeTab)}
      />
      {errors[`title-${activeTab}`] && (
  <div className="field-error">{errors[`title-${activeTab}`]}</div>
)}

      <textarea
        placeholder={`Descripción (${activeTab})`}
        value={formData.description[activeTab]}
        onChange={(e) => handleChange("description", e.target.value, activeTab)}
      />
      {errors[`title-${activeTab}`] && (
  <div className="field-error">{errors[`description-${activeTab}`]}</div>
)}

      <input
        type="text"
        placeholder={`Ubicación (${activeTab})`}
        value={formData.location[activeTab]}
        onChange={(e) => handleChange("location", e.target.value, activeTab)}
      />
            {errors[`title-${activeTab}`] && (
  <div className="field-error">{errors[`location-${activeTab}`]}</div>
)}

      <label>Tipo de fecha:</label>
      <select
        value={formData.dateType}
        onChange={(e) => handleChange("dateType", e.target.value)}
      >
        <option value="single">Fecha única</option>
        <option value="range">Rango de fechas</option>
      </select>

      {formData.dateType === "single" ? (
        <input
          type="date"
          value={formData.singleDate}
          onChange={(e) => handleChange("singleDate", e.target.value)}
        />
      ) : (
        <>
          <input
            type="date"
            value={formData.dateRange.start}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                dateRange: { ...prev.dateRange, start: e.target.value },
              }))
            }
          />
          <input
            type="date"
            value={formData.dateRange.end}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                dateRange: { ...prev.dateRange, end: e.target.value },
              }))
            }
          />
        </>
      )}

      <input
        type="text"
        placeholder="Horario (ej: 10:00 a 14:00)"
        value={formData.time}
        onChange={(e) => handleChange("time", e.target.value)}
      />
      <input
        type="text"
        placeholder="Link de inscripción"
        value={formData.registrationLink}
        onChange={(e) => handleChange("registrationLink", e.target.value)}
      />



      <div className="button-group">
        <button type="submit">✅ Guardar</button>
        <button type="button" onClick={onCancel}>
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default PresentialFormationForm;
