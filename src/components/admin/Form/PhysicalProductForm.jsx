import { useRef, useState } from "react";
import "./CourseForm.css";
import validatePhysicalProductForm from "../../../utils/validations/validatePhysicalProductForm";

const LANGS = ["es", "en", "fr"];

const emptyLang = { es: "", en: "", fr: "" };

const normalizeLangObj = (val) => {
  if (val && typeof val === "object") {
    return {
      es: val.es || "",
      en: val.en || "",
      fr: val.fr || "",
    };
  }
  // si viene string viejo, lo metemos en ES para no romper
  if (typeof val === "string") {
    return { es: val, en: "", fr: "" };
  }
  return { ...emptyLang };
};

const PhysicalProductForm = ({ initialData = {}, onSave, onCancel }) => {
  const [activeLang, setActiveLang] = useState("es");

  const [formData, setFormData] = useState({
    title: normalizeLangObj(initialData.title),
    description: normalizeLangObj(initialData.description),
    imageUrl: initialData.imageUrl || "",
    amazonUrl: initialData.amazonUrl || "",
    priceEur: initialData.priceEur ?? 0,
    stock: initialData.stock ?? 0,
  });

  const [errors, setErrors] = useState({});

  // refs (por idioma para título)
  const titleRefs = {
    es: useRef(null),
    en: useRef(null),
    fr: useRef(null),
  };

  const imageUrlRef = useRef(null);
  const amazonUrlRef = useRef(null);
  const priceRef = useRef(null);
  const stockRef = useRef(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validatePhysicalProductForm(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.title && titleRefs[activeLang]?.current) {
        titleRefs[activeLang].current.focus();
      } else if (newErrors.imageUrl && imageUrlRef.current) imageUrlRef.current.focus();
      else if (newErrors.amazonUrl && amazonUrlRef.current) amazonUrlRef.current.focus();
      else if (newErrors.priceEur && priceRef.current) priceRef.current.focus();
      else if (newErrors.stock && stockRef.current) stockRef.current.focus();
      return;
    }

    onSave({
      ...formData,
      priceEur: Number(formData.priceEur),
      stock: Number(formData.stock),
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

      {/* Título multilenguaje */}
      <label className="label-formulario">
        🛍️ Título del producto ({activeLang.toUpperCase()}):
      </label>
      <input
        ref={titleRefs[activeLang]}
        type="text"
        placeholder={
          activeLang === "es"
            ? "Ej: Rodilleras para entrenamiento"
            : activeLang === "en"
            ? "E.g.: Training knee pads"
            : "Ex : Genouillères d'entraînement"
        }
        value={formData.title[activeLang]}
        onChange={(e) => handleLangChange("title", activeLang, e.target.value)}
      />
      {errors.title && <div className="field-error">{errors.title}</div>}

      {/* Descripción multilenguaje */}
      <label className="label-formulario">
        📝 Descripción (opcional) ({activeLang.toUpperCase()}):
      </label>
      <textarea
        placeholder={
          activeLang === "es"
            ? "Ej: cómodas, resistentes, ideales para..."
            : activeLang === "en"
            ? "E.g.: comfy, resistant, ideal for..."
            : "Ex : confortables, résistantes, idéales pour..."
        }
        value={formData.description[activeLang]}
        onChange={(e) =>
          handleLangChange("description", activeLang, e.target.value)
        }
      />

      {/* Campos no multilenguaje */}
      <label className="label-formulario">🖼️ URL de imagen:</label>
      <input
        ref={imageUrlRef}
        type="text"
        placeholder="https://..."
        value={formData.imageUrl}
        onChange={(e) => handleChange("imageUrl", e.target.value)}
      />
      {errors.imageUrl && <div className="field-error">{errors.imageUrl}</div>}

      <label className="label-formulario">🔗 Link de Amazon:</label>
      <input
        ref={amazonUrlRef}
        type="text"
        placeholder="https://amazon..."
        value={formData.amazonUrl}
        onChange={(e) => handleChange("amazonUrl", e.target.value)}
      />
      {errors.amazonUrl && <div className="field-error">{errors.amazonUrl}</div>}

      <label className="label-formulario">💶 Precio (€):</label>
      <input
        ref={priceRef}
        type="number"
        step="0.01"
        min="0"
        placeholder="Ej: 29.99"
        value={formData.priceEur}
        onChange={(e) => handleChange("priceEur", e.target.value)}
      />
      {errors.priceEur && <div className="field-error">{errors.priceEur}</div>}

      <label className="label-formulario">📦 Stock (entero):</label>
      <input
        ref={stockRef}
        type="number"
        step="1"
        min="0"
        placeholder="Ej: 10"
        value={formData.stock}
        onChange={(e) => handleChange("stock", e.target.value)}
      />
      {errors.stock && <div className="field-error">{errors.stock}</div>}

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

export default PhysicalProductForm;
