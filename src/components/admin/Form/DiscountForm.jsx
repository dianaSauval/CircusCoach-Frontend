import { useState, useEffect, useRef } from "react";
import "./CourseForm.css";
import { getAllCourses } from "../../../services/courseService";
import { getAllFormations } from "../../../services/formationService";
import validateDiscountForm from "../../../utils/validations/validateDiscountForm";

const LANGS = ["es", "en", "fr"];
const emptyLang = { es: "", en: "", fr: "" };

const normalizeLangObj = (val) => {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    return {
      es: val.es || "",
      en: val.en || "",
      fr: val.fr || "",
    };
  }
  // compat: si viene string viejo, lo metemos en ES
  if (typeof val === "string") return { es: val, en: "", fr: "" };
  return { ...emptyLang };
};

const DiscountForm = ({ initialData = {}, onSave, onCancel }) => {
  const [activeLang, setActiveLang] = useState("es");

  const [formData, setFormData] = useState({
    name: normalizeLangObj(initialData.name),
    description: normalizeLangObj(initialData.description),
    percentage: initialData.percentage || 0,
    amount: initialData.amount || 0,
    startDate: initialData.startDate ? initialData.startDate.slice(0, 10) : "",
    endDate: initialData.endDate ? initialData.endDate.slice(0, 10) : "",
    active: initialData.active ?? true,
    type: initialData.type || "course",
    targetItems: Array.isArray(initialData.targetItems)
      ? initialData.targetItems.map((it) => ({
          _id: it._id,
          title: normalizeLangObj(it.title),
        }))
      : [],
  });

  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [formations, setFormations] = useState([]);

  // Refs por idioma para name
  const nameRefs = {
    es: useRef(null),
    en: useRef(null),
    fr: useRef(null),
  };

  const percentageRef = useRef(null);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (formData.type === "course" || formData.type === "both") {
          const resCourses = await getAllCourses();
          setCourses(resCourses);
        } else setCourses([]);

        if (formData.type === "formation" || formData.type === "both") {
          const resFormations = await getAllFormations();
          setFormations(resFormations);
        } else setFormations([]);
      } catch (error) {
        console.error("Error al cargar cursos/formaciones:", error);
      }
    };

    fetchItems();
  }, [formData.type]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleLangChange = (field, lang, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));

    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const toggleTargetItem = (entity) => {
    setFormData((prev) => {
      const exists = prev.targetItems.some((it) => it._id === entity._id);
      if (!exists) {
        return {
          ...prev,
          targetItems: [
            ...prev.targetItems,
            { _id: entity._id, title: normalizeLangObj(entity.title) },
          ],
        };
      }
      return {
        ...prev,
        targetItems: prev.targetItems.filter((it) => it._id !== entity._id),
      };
    });

    setErrors((prev) => {
      if (!("targetItems" in prev)) return prev;
      const updated = { ...prev };
      delete updated.targetItems;
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateDiscountForm(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.name && nameRefs[activeLang]?.current) nameRefs[activeLang].current.focus();
      else if (newErrors.percentage && percentageRef.current) percentageRef.current.focus();
      else if (newErrors.startDate && startDateRef.current) startDateRef.current.focus();
      else if (newErrors.endDate && endDateRef.current) endDateRef.current.focus();
      return;
    }

    onSave({
      ...formData,
      percentage: Number(formData.percentage) || 0,
      amount: Number(formData.amount) || 0,
      targetItems: formData.targetItems.map((it) => ({
        _id: it._id,
        title: normalizeLangObj(it.title),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="presential-form">
      {/* Tabs idiomas */}
      <div className="language-tabs">
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            className={activeLang === l ? "active" : ""}
            onClick={() => setActiveLang(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Name multilenguaje */}
      <label className="label-formulario">
        🎁 Nombre del bono ({activeLang.toUpperCase()}):
      </label>
      <input
        ref={nameRefs[activeLang]}
        type="text"
        placeholder={
          activeLang === "es"
            ? "Ej: Promo Invierno"
            : activeLang === "en"
            ? "E.g.: Winter promo"
            : "Ex : Promo d'hiver"
        }
        value={formData.name[activeLang]}
        onChange={(e) => handleLangChange("name", activeLang, e.target.value)}
      />
      {errors.name && <div className="field-error">{errors.name}</div>}

      {/* Description multilenguaje */}
      <label className="label-formulario">
        📝 Descripción (opcional) ({activeLang.toUpperCase()}):
      </label>
      <textarea
        placeholder={
          activeLang === "es"
            ? "Detalle interno o público de la campaña"
            : activeLang === "en"
            ? "Internal/public campaign details"
            : "Détails internes/publics de la campagne"
        }
        value={formData.description[activeLang]}
        onChange={(e) => handleLangChange("description", activeLang, e.target.value)}
      />

      {/* Descuentos */}
      <label className="label-formulario">📊 Descuento (%):</label>
      <input
        ref={percentageRef}
        type="number"
        min="0"
        max="100"
        placeholder="Ej: 20"
        value={formData.percentage}
        onChange={(e) => handleChange("percentage", e.target.value)}
      />
      {errors.percentage && <div className="field-error">{errors.percentage}</div>}

      {/* Fechas */}
      <label className="label-formulario">📅 Fecha de inicio:</label>
      <input
        ref={startDateRef}
        type="date"
        value={formData.startDate}
        onChange={(e) => handleChange("startDate", e.target.value)}
      />
      {errors.startDate && <div className="field-error">{errors.startDate}</div>}

      <label className="label-formulario">📅 Fecha de fin:</label>
      <input
        ref={endDateRef}
        type="date"
        value={formData.endDate}
        onChange={(e) => handleChange("endDate", e.target.value)}
      />
      {errors.endDate && <div className="field-error">{errors.endDate}</div>}

      {/* Tipo */}
      <label className="label-formulario">🎯 Aplica a:</label>
      <select value={formData.type} onChange={(e) => handleChange("type", e.target.value)}>
        <option value="course">Cursos</option>
        <option value="formation">Formaciones</option>
        <option value="both">Ambos</option>
      </select>

      {/* Cursos */}
      {(formData.type === "course" || formData.type === "both") && (
        <>
          <label className="label-formulario">📚 Cursos:</label>
          <div className="checkbox-list">
            {courses.map((course) => {
              const label = course.title?.es || "Curso sin título";
              const checked = formData.targetItems.some((it) => it._id === course._id);
              return (
                <label key={course._id}>
                  {label}
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTargetItem(course)}
                  />
                </label>
              );
            })}
          </div>
        </>
      )}

      {/* Formaciones */}
      {(formData.type === "formation" || formData.type === "both") && (
        <>
          <label className="label-formulario">🎓 Formaciones:</label>
          <div className="checkbox-list">
            {formations.map((formation) => {
              const label = formation.title?.es || "Formación sin título";
              const checked = formData.targetItems.some((it) => it._id === formation._id);
              return (
                <label key={formation._id}>
                  {label}
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTargetItem(formation)}
                  />
                </label>
              );
            })}
          </div>
        </>
      )}

      {errors.targetItems && <div className="field-error">{errors.targetItems}</div>}

      {/* Estado */}
      <label className="label-formulario">✔️ Estado:</label>
      <select
        value={formData.active ? "true" : "false"}
        onChange={(e) => handleChange("active", e.target.value === "true")}
      >
        <option value="true">Activo</option>
        <option value="false">Inactivo</option>
      </select>

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

export default DiscountForm;
