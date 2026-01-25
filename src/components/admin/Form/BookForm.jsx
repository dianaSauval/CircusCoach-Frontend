import { useRef, useState } from "react";
import "./CourseForm.css";
import "./BookForm.css";
import { FaFilePdf, FaTrashAlt, FaExternalLinkAlt, FaImage } from "react-icons/fa";

import {
  subirPdfLibro,
  subirImagenCurso,
  eliminarArchivoDesdeFrontend,
} from "../../../services/uploadCloudinary";

const BookForm = ({ initialData = {}, onSave, onCancel }) => {
  const [loadingUpload, setLoadingUpload] = useState(false);

  // ✅ Track de temporales (si subís y borrás antes de guardar => borra Cloudinary)
  const [tempUploads, setTempUploads] = useState({
    pdfPublicId: "",
    coverPublicId: "",
  });

  // ✅ Flags para que el backend borre assets previos al guardar (solo update)
  const [deleteFlags, setDeleteFlags] = useState({
    deletePreviousPdf: false,
    deletePreviousCover: false,
  });

  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    language: initialData.language || "es",
    slug: initialData.slug || "",
    price: initialData.price ?? 0,

    pdf: initialData.pdf || { url: "", public_id: "" },
    coverImage: initialData.coverImage || { url: "", public_id: "" },

    visible: initialData.visible ?? false,

    access: {
      ...(initialData.access || {}),
      viewOnline: true,
      downloadable: true,
    },

    type: initialData.type || "ebook_pdf",
  });

  const [errors, setErrors] = useState({});

  const titleRef = useRef(null);
  const slugRef = useRef(null);
  const priceRef = useRef(null);
  const pdfRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const pdfLoaded = !!formData.pdf?.url;
  const coverLoaded = !!formData.coverImage?.url;

  // =========================
  // 📄 PDF
  // =========================
  const handleUploadPdf = async (file) => {
    if (!file) return;
    setLoadingUpload(true);

    try {
      const uploaded = await subirPdfLibro(file, formData.title || "libro");

      const prevPublicId = formData.pdf?.public_id;
      if (prevPublicId && prevPublicId !== uploaded.public_id) {
        setDeleteFlags((prev) => ({ ...prev, deletePreviousPdf: true }));
      }

      setFormData((prev) => ({ ...prev, pdf: uploaded }));
      setTempUploads((prev) => ({ ...prev, pdfPublicId: uploaded.public_id }));

      // limpiar error
      setErrors((prev) => {
        if (!prev.pdf) return prev;
        const updated = { ...prev };
        delete updated.pdf;
        return updated;
      });

      // opcional: limpiar el value del input para evitar “mismo archivo”
      if (pdfRef.current) pdfRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("No se pudo subir el PDF del libro");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleDeletePdf = async () => {
    const pid = formData.pdf?.public_id;

    // Si es temporal => borrar YA
    if (pid && tempUploads.pdfPublicId && pid === tempUploads.pdfPublicId) {
      try {
        await eliminarArchivoDesdeFrontend(pid, "raw");
      } catch (e) {
        console.warn("⚠️ No se pudo borrar PDF temporal:", e);
      } finally {
        setTempUploads((prev) => ({ ...prev, pdfPublicId: "" }));
      }
    } else if (pid) {
      // Persistido => marcar para borrar al guardar
      setDeleteFlags((prev) => ({ ...prev, deletePreviousPdf: true }));
    }

    setFormData((prev) => ({ ...prev, pdf: { url: "", public_id: "" } }));
  };

  // =========================
  // 🖼️ COVER
  // =========================
  const handleUploadCover = async (file) => {
    if (!file) return;
    setLoadingUpload(true);

    try {
      const uploaded = await subirImagenCurso(file, `cover_${formData.title || "libro"}`);

      const prevPublicId = formData.coverImage?.public_id;
      if (prevPublicId && prevPublicId !== uploaded.public_id) {
        setDeleteFlags((prev) => ({ ...prev, deletePreviousCover: true }));
      }

      setFormData((prev) => ({ ...prev, coverImage: uploaded }));
      setTempUploads((prev) => ({ ...prev, coverPublicId: uploaded.public_id }));
    } catch (err) {
      console.error(err);
      alert("No se pudo subir la portada");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleDeleteCover = async () => {
    const pid = formData.coverImage?.public_id;

    // Temporal => borrar YA
    if (pid && tempUploads.coverPublicId && pid === tempUploads.coverPublicId) {
      try {
        await eliminarArchivoDesdeFrontend(pid, "image");
      } catch (e) {
        console.warn("⚠️ No se pudo borrar portada temporal:", e);
      } finally {
        setTempUploads((prev) => ({ ...prev, coverPublicId: "" }));
      }
    } else if (pid) {
      // Persistida => marcar para borrar al guardar
      setDeleteFlags((prev) => ({ ...prev, deletePreviousCover: true }));
    }

    setFormData((prev) => ({ ...prev, coverImage: { url: "", public_id: "" } }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Ingresá un título.";

    if (!formData.slug.trim()) {
      newErrors.slug = "Ingresá un slug.";
    } else if (formData.slug.trim().includes(" ")) {
      newErrors.slug = "El slug no puede tener espacios (usá guiones).";
    }

    if (formData.price === "" || Number(formData.price) < 0) {
      newErrors.price = "El precio debe ser 0 o mayor.";
    }

    if (!formData.pdf?.url) {
      newErrors.pdf = "Subí el PDF del libro.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.title && titleRef.current) titleRef.current.focus();
      else if (newErrors.slug && slugRef.current) slugRef.current.focus();
      else if (newErrors.price && priceRef.current) priceRef.current.focus();
      else if (newErrors.pdf && pdfRef.current) pdfRef.current.focus();
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      type: "ebook_pdf",
      access: { viewOnline: true, downloadable: true },

      // ✅ flags para updateBook (si aplica)
      deletePreviousPdf: deleteFlags.deletePreviousPdf,
      deletePreviousCover: deleteFlags.deletePreviousCover,
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="presential-form">
      <label className="label-formulario">📘 Título del libro:</label>
      <input
        ref={titleRef}
        type="text"
        placeholder="Ej: Manual de Cyr Wheel"
        value={formData.title}
        onChange={(e) => handleChange("title", e.target.value)}
      />
      {errors.title && <div className="field-error">{errors.title}</div>}

      <label className="label-formulario">📝 Descripción (opcional):</label>
      <textarea
        placeholder="Ej: qué incluye, para quién es, etc."
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />

      <label className="label-formulario">🌍 Idioma del libro:</label>
      <select
        value={formData.language}
        onChange={(e) => handleChange("language", e.target.value)}
      >
        <option value="es">ES</option>
        <option value="en">EN</option>
        <option value="fr">FR</option>
      </select>

      <label className="label-formulario">🏷️ Slug:</label>
      <input
        ref={slugRef}
        type="text"
        placeholder="ej: manual-cyr-wheel"
        value={formData.slug}
        onChange={(e) => handleChange("slug", e.target.value)}
      />
      <small className="book-form-help">
        El <strong>slug</strong> es un identificador único (sin espacios) que se
        usa en la URL y también para nombrar el archivo al descargarlo. Ej:{" "}
        <em>manual-cyr-wheel</em>
      </small>
      {errors.slug && <div className="field-error">{errors.slug}</div>}

      <label className="label-formulario">💶 Precio (EUR):</label>
      <input
        ref={priceRef}
        type="number"
        step="0.01"
        min="0"
        placeholder="Ej: 19.99"
        value={formData.price}
        onChange={(e) => handleChange("price", e.target.value)}
      />
      {errors.price && <div className="field-error">{errors.price}</div>}

      <label className="label-formulario">👁️ Visibilidad en tienda:</label>
      <div className="book-visible-row">
        <input
          id="visible"
          type="checkbox"
          checked={formData.visible}
          onChange={(e) => handleChange("visible", e.target.checked)}
        />
        <label htmlFor="visible" style={{ cursor: "pointer" }}>
          {formData.visible ? "Visible ✅" : "Oculto ⛔️"}
        </label>
      </div>

      {/* =========================
          PDF: input (solo si no hay) + mini card
         ========================= */}
      <label className="label-formulario">📄 PDF del libro:</label>

      {!pdfLoaded && (
        <input
          ref={pdfRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => handleUploadPdf(e.target.files?.[0])}
          disabled={loadingUpload}
        />
      )}

      <div className={`book-file-card ${pdfLoaded ? "is-loaded" : "is-empty"}`}>
        <div className="book-file-left">
          <div className="book-file-icon">
            <FaFilePdf />
          </div>

          <div className="book-file-info">
            <div className="book-file-title">PDF del libro</div>
            <div className={`book-file-pill ${pdfLoaded ? "ok" : "no"}`}>
              {pdfLoaded ? "Cargado ✅" : "No cargado ⛔️"}
            </div>
          </div>
        </div>

        <div className="book-file-actions">
          {pdfLoaded && (
            <button
              type="button"
              className="book-file-btn"
              onClick={() => window.open(formData.pdf.url, "_blank", "noopener,noreferrer")}
            >
              <FaExternalLinkAlt /> Ver
            </button>
          )}

          {pdfLoaded && (
            <button
              type="button"
              className="book-file-btn danger"
              onClick={handleDeletePdf}
              disabled={loadingUpload}
              title="Eliminar PDF"
            >
              <FaTrashAlt />
            </button>
          )}
        </div>
      </div>

      {errors.pdf && <div className="field-error">{errors.pdf}</div>}

      {/* =========================
          COVER: input (solo si no hay) + mini card
         ========================= */}
      <label className="label-formulario">🖼️ Portada (opcional):</label>

      {!coverLoaded && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleUploadCover(e.target.files?.[0])}
          disabled={loadingUpload}
        />
      )}

      <div className={`book-file-card ${coverLoaded ? "is-loaded" : "is-empty"}`}>
        <div className="book-file-left">
          <div className="book-file-thumb">
            {coverLoaded ? (
              <img src={formData.coverImage.url} alt="Portada" />
            ) : (
              <FaImage />
            )}
          </div>

          <div className="book-file-info">
            <div className="book-file-title">Portada</div>
            <div className={`book-file-pill ${coverLoaded ? "ok" : "no"}`}>
              {coverLoaded ? "Cargada ✅" : "No cargada (opcional)"}
            </div>
          </div>
        </div>

        <div className="book-file-actions">
          {coverLoaded && (
            <button
              type="button"
              className="book-file-btn"
              onClick={() => window.open(formData.coverImage.url, "_blank", "noopener,noreferrer")}
            >
              <FaExternalLinkAlt /> Ver
            </button>
          )}

          {coverLoaded && (
            <button
              type="button"
              className="book-file-btn danger"
              onClick={handleDeleteCover}
              disabled={loadingUpload}
              title="Eliminar portada"
            >
              <FaTrashAlt />
            </button>
          )}
        </div>
      </div>

      <div className="button-group">
        <button className="boton-agregar" type="submit" disabled={loadingUpload}>
          {loadingUpload ? "⏳ Subiendo..." : "✅ Guardar"}
        </button>
        <button className="boton-eliminar" type="button" onClick={onCancel} disabled={loadingUpload}>
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default BookForm;
