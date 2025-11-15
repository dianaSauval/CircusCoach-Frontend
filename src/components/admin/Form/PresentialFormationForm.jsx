// components/admin/Form/PresentialFormationForm.jsx
import { useRef, useState } from "react";
import LanguageTabs from "../LanguageTabs/LanguageTabs";
import "./CourseForm.css";
import validatePresentialFormationForm from "../../../utils/validations/validatePresentialFormationForm";

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

  // Refs para foco automático
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const locationRef = useRef(null);
  const singleDateRef = useRef(null);
  const rangeStartRef = useRef(null);
  const rangeEndRef = useRef(null);

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

    const errorKey = lang ? `${field}-${lang}` : field;
    setErrors((prevErrors) => {
      if (!(errorKey in prevErrors)) return prevErrors;
      const updated = { ...prevErrors };
      delete updated[errorKey];
      return updated;
    });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const { errors: newErrors } = validatePresentialFormationForm(formData);

  setErrors(newErrors);

  // Auto-focus al primer error encontrado
  const firstErrorKey = Object.keys(newErrors)[0];

  const refMap = {
    [`title-${activeTab}`]: titleRef,
    [`description-${activeTab}`]: descriptionRef,
    [`location-${activeTab}`]: locationRef,
    singleDate: singleDateRef,
    rangeStart: rangeStartRef,
    rangeEnd: rangeEndRef,
  };

  const ref = refMap[firstErrorKey];
  if (ref?.current) {
    ref.current.focus();
    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (Object.keys(newErrors).length > 0) {
    setGlobalError("Revisa los campos marcados en rojo.");
    return;
  }

  setGlobalError("");
  setErrors({});
  onSave(formData);
};


  return (
    <form onSubmit={handleSubmit} className="presential-form">
      <LanguageTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {globalError && <div className="global-error">{globalError}</div>}

      <label className="label-formulario">Título:</label>
      <input
        type="text"
        ref={titleRef}
        placeholder={`Título (${activeTab})`}
        value={formData.title[activeTab]}
        onChange={(e) => handleChange("title", e.target.value, activeTab)}
      />
      {errors[`title-${activeTab}`] && (
        <div className="field-error">{errors[`title-${activeTab}`]}</div>
      )}

      <label className="label-formulario">Descripción:</label>
      <textarea
        ref={descriptionRef}
        placeholder={`Descripción (${activeTab})`}
        value={formData.description[activeTab]}
        onChange={(e) => handleChange("description", e.target.value, activeTab)}
      />
      {errors[`description-${activeTab}`] && (
        <div className="field-error">{errors[`description-${activeTab}`]}</div>
      )}

      <label className="label-formulario">Ubicación:</label>
      <input
        type="text"
        ref={locationRef}
        placeholder={`Ubicación (${activeTab})`}
        value={formData.location[activeTab]}
        onChange={(e) => handleChange("location", e.target.value, activeTab)}
      />
      {errors[`location-${activeTab}`] && (
        <div className="field-error">{errors[`location-${activeTab}`]}</div>
      )}

      <div className="campo-fechas">
        <label className="label-formulario" htmlFor="dateType">
          🗓️ Tipo de fecha:
        </label>
        <select
          id="dateType"
          className="select-fechas"
          value={formData.dateType}
          onChange={(e) => handleChange("dateType", e.target.value)}
        >
          <option value="single">📅 Fecha única</option>
          <option value="range">📆 Rango de fechas</option>
        </select>

        {formData.dateType === "single" ? (
          <div className="campo-fecha-unica">
            <label htmlFor="singleDate" className="label-formulario">
              Selecciona una fecha:
            </label>
            <input
              id="singleDate"
              ref={singleDateRef}
              type="date"
              className="input-fecha"
              value={formData.singleDate}
              onChange={(e) => handleChange("singleDate", e.target.value)}
            />
            {errors.singleDate && (
              <div className="field-error">{errors.singleDate}</div>
            )}
          </div>
        ) : (
          <div className="campo-rango-fechas">
            <label className="label-formulario">Rango de fechas:</label>
            <div className="rango-inputs">
              <input
                type="date"
                ref={rangeStartRef}
                className="input-fecha"
                value={formData.dateRange.start}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value },
                  }))
                }
              />
              <span className="guion-rango">—</span>
              <input
                type="date"
                ref={rangeEndRef}
                className="input-fecha"
                value={formData.dateRange.end}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value },
                  }))
                }
              />
            </div>
            {errors.rangeStart && (
              <div className="field-error">{errors.rangeStart}</div>
            )}
            {errors.rangeEnd && (
              <div className="field-error">{errors.rangeEnd}</div>
            )}
          </div>
        )}
      </div>

      <label className="label-formulario">Horario:</label>
      <input
        type="text"
        placeholder="Horario (ej: 10:00 a 14:00)"
        value={formData.time}
        onChange={(e) => handleChange("time", e.target.value)}
      />

      <label className="label-formulario">Link de inscripción:</label>
      <input
        type="text"
        placeholder="Link de inscripción"
        value={formData.registrationLink}
        onChange={(e) => handleChange("registrationLink", e.target.value)}
      />

      <div className="button-group">
        <button className="boton-agregar" type="submit">
          ✅ Guardar
        </button>
        <button className="boton-eliminar" type="button" onClick={onCancel}>
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default PresentialFormationForm;
