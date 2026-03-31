import { useEffect, useRef, useState } from "react";
import "./CourseForm.css";
import "./ResetEditionForm.css";

const EMPTY_INITIAL_DATA = {};

const formatDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
};

const buildInitialSessions = (initialSessions = [], totalSessions = 4) => {
  const mapped = Array.isArray(initialSessions)
    ? initialSessions.map((session) => ({
        date: formatDateTimeLocal(session.date),
      }))
    : [];

  while (mapped.length < totalSessions) {
    mapped.push({ date: "" });
  }

  return mapped.slice(0, totalSessions);
};

const buildInitialFormData = (initialData = EMPTY_INITIAL_DATA) => {
  const totalSessions = initialData.totalSessions ?? 4;

  return {
    title: initialData.title || "",
    durationWeeks: initialData.durationWeeks ?? 4,
    totalSessions,
    sessions: buildInitialSessions(initialData.sessions, totalSessions),
    capacity: initialData.capacity ?? 10,
    price: initialData.price ?? 250,
    visible: initialData.visible ?? true,
    manuallyClosed: initialData.manuallyClosed ?? false,
    notes: initialData.notes || "",
    whatsappGroupLink: initialData.whatsappGroupLink || "",
  };
};

const isValidWhatsAppLink = (value) => {
  if (!value.trim()) return true;
  return /^https?:\/\/(chat\.whatsapp\.com|wa\.me)\/.+/i.test(value.trim());
};

const ResetEditionForm = ({
  initialData = EMPTY_INITIAL_DATA,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState(() => buildInitialFormData(initialData));
  const [errors, setErrors] = useState({});

  const titleRef = useRef(null);
  const capacityRef = useRef(null);
  const priceRef = useRef(null);
  const totalSessionsRef = useRef(null);
  const firstSessionRef = useRef(null);
  const whatsappGroupLinkRef = useRef(null);

  useEffect(() => {
    setFormData(buildInitialFormData(initialData));
  }, [initialData]);

  const clearError = (field) => {
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    clearError(field);
  };

  const handleSessionChange = (index, value) => {
    setFormData((prev) => {
      const updatedSessions = [...prev.sessions];
      updatedSessions[index] = { ...updatedSessions[index], date: value };

      return {
        ...prev,
        sessions: updatedSessions,
      };
    });

    clearError(`session_${index}`);
    clearError("sessions");
  };

  const handleTotalSessionsChange = (value) => {
    const numericValue = Math.max(1, Number(value) || 1);

    setFormData((prev) => {
      const adjustedSessions = [...prev.sessions];

      if (numericValue > adjustedSessions.length) {
        while (adjustedSessions.length < numericValue) {
          adjustedSessions.push({ date: "" });
        }
      } else if (numericValue < adjustedSessions.length) {
        adjustedSessions.length = numericValue;
      }

      return {
        ...prev,
        totalSessions: numericValue,
        sessions: adjustedSessions,
      };
    });

    clearError("totalSessions");
    clearError("sessions");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Ingresá un título para la edición.";
    }

    if (Number(formData.durationWeeks) < 1) {
      newErrors.durationWeeks = "La duración debe ser de al menos 1 semana.";
    }

    if (Number(formData.totalSessions) < 1) {
      newErrors.totalSessions = "Debe haber al menos 1 encuentro.";
    }

    if (!Array.isArray(formData.sessions) || formData.sessions.length === 0) {
      newErrors.sessions = "Debes cargar al menos un encuentro.";
    }

    if (formData.sessions.length !== Number(formData.totalSessions)) {
      newErrors.sessions =
        "La cantidad de encuentros debe coincidir con totalSessions.";
    }

    formData.sessions.forEach((session, index) => {
      if (!session.date) {
        newErrors[`session_${index}`] = `Completá la fecha y hora del encuentro ${index + 1}.`;
      } else if (Number.isNaN(new Date(session.date).getTime())) {
        newErrors[`session_${index}`] = `La fecha del encuentro ${index + 1} no es válida.`;
      }
    });

    if (Number(formData.capacity) < 1) {
      newErrors.capacity = "La capacidad debe ser mayor a 0.";
    }

    if (Number(formData.price) < 0) {
      newErrors.price = "El precio no puede ser negativo.";
    }

    if (!isValidWhatsAppLink(formData.whatsappGroupLink)) {
      newErrors.whatsappGroupLink =
        "Ingresá un link válido de WhatsApp (chat.whatsapp.com o wa.me).";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.title && titleRef.current) {
        titleRef.current.focus();
      } else if (newErrors.totalSessions && totalSessionsRef.current) {
        totalSessionsRef.current.focus();
      } else if ((newErrors.sessions || newErrors.session_0) && firstSessionRef.current) {
        firstSessionRef.current.focus();
      } else if (newErrors.capacity && capacityRef.current) {
        capacityRef.current.focus();
      } else if (newErrors.price && priceRef.current) {
        priceRef.current.focus();
      } else if (newErrors.whatsappGroupLink && whatsappGroupLinkRef.current) {
        whatsappGroupLinkRef.current.focus();
      }
      return;
    }

    onSave({
      title: formData.title.trim(),
      durationWeeks: Number(formData.durationWeeks),
      totalSessions: Number(formData.totalSessions),
      sessions: formData.sessions.map((session) => ({
        date: new Date(session.date).toISOString(),
      })),
      capacity: Number(formData.capacity),
      price: Number(formData.price),
      visible: formData.visible,
      manuallyClosed: formData.manuallyClosed,
      notes: formData.notes.trim(),
      whatsappGroupLink: formData.whatsappGroupLink.trim(),
    });
  };

  const computedStatus = initialData.status || null;
  const occupiedSpots = initialData.occupiedSpots ?? 0;
  const availableSpots =
    initialData.availableSpots ??
    Math.max((initialData.capacity ?? 0) - occupiedSpots, 0);

  return (
    <form onSubmit={handleSubmit} className="presential-form reset-form">
      <label className="label-formulario">🔥 Título de la edición:</label>
      <input
        ref={titleRef}
        type="text"
        placeholder="Ej: RESET junio 2026"
        value={formData.title}
        onChange={(e) => handleChange("title", e.target.value)}
        disabled={isSaving}
      />
      {errors.title && <div className="field-error">{errors.title}</div>}

      <label className="label-formulario">⏳ Duración (semanas):</label>
      <input
        type="number"
        min="1"
        value={formData.durationWeeks}
        onChange={(e) => handleChange("durationWeeks", e.target.value)}
        disabled={isSaving}
      />
      {errors.durationWeeks && <div className="field-error">{errors.durationWeeks}</div>}

      <label className="label-formulario">🗓️ Cantidad de encuentros:</label>
      <input
        ref={totalSessionsRef}
        type="number"
        min="1"
        value={formData.totalSessions}
        onChange={(e) => handleTotalSessionsChange(e.target.value)}
        disabled={isSaving}
      />
      {errors.totalSessions && <div className="field-error">{errors.totalSessions}</div>}

      <div className="reset-sessions-block">
        <label className="label-formulario">📅 Día y hora de cada encuentro:</label>

        {formData.sessions.map((session, index) => (
          <div key={index} className="reset-session-row">
            <label className="reset-session-label">Encuentro {index + 1}</label>
            <input
              ref={index === 0 ? firstSessionRef : null}
              type="datetime-local"
              value={session.date}
              onChange={(e) => handleSessionChange(index, e.target.value)}
              disabled={isSaving}
            />
            {errors[`session_${index}`] && (
              <div className="field-error">{errors[`session_${index}`]}</div>
            )}
          </div>
        ))}

        {errors.sessions && <div className="field-error">{errors.sessions}</div>}
      </div>

      <label className="label-formulario">👥 Capacidad total:</label>
      <input
        ref={capacityRef}
        type="number"
        min="1"
        value={formData.capacity}
        onChange={(e) => handleChange("capacity", e.target.value)}
        disabled={isSaving}
      />
      {errors.capacity && <div className="field-error">{errors.capacity}</div>}

      <label className="label-formulario">💶 Precio (EUR):</label>
      <input
        ref={priceRef}
        type="number"
        step="0.01"
        min="0"
        value={formData.price}
        onChange={(e) => handleChange("price", e.target.value)}
        disabled={isSaving}
      />
      {errors.price && <div className="field-error">{errors.price}</div>}

      <label className="label-formulario">
        💬 Link del grupo de WhatsApp (opcional):
      </label>
      <input
        ref={whatsappGroupLinkRef}
        type="url"
        placeholder="Ej: https://chat.whatsapp.com/..."
        value={formData.whatsappGroupLink}
        onChange={(e) => handleChange("whatsappGroupLink", e.target.value)}
        disabled={isSaving}
      />
      {errors.whatsappGroupLink && (
        <div className="field-error">{errors.whatsappGroupLink}</div>
      )}

      <label className="label-formulario">👁️ Visibilidad pública:</label>
      <div className="reset-visible-row">
        <input
          id="reset-visible"
          type="checkbox"
          checked={formData.visible}
          onChange={(e) => handleChange("visible", e.target.checked)}
          disabled={isSaving}
        />
        <label htmlFor="reset-visible" style={{ cursor: "pointer" }}>
          {formData.visible ? "Visible ✅" : "Oculta ⛔️"}
        </label>
      </div>

      <label className="label-formulario">🔒 Inscripción manualmente cerrada:</label>
      <div className="reset-visible-row">
        <input
          id="reset-closed"
          type="checkbox"
          checked={formData.manuallyClosed}
          onChange={(e) => handleChange("manuallyClosed", e.target.checked)}
          disabled={isSaving}
        />
        <label htmlFor="reset-closed" style={{ cursor: "pointer" }}>
          {formData.manuallyClosed ? "Cerrada 🔒" : "Abierta 🔓"}
        </label>
      </div>

      <label className="label-formulario">📝 Notas internas (opcional):</label>
      <textarea
        placeholder="Ej: edición especial, observaciones, aclaraciones internas..."
        value={formData.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        disabled={isSaving}
      />

      {(computedStatus || initialData._id) && (
        <div className="reset-edition-meta">
          {computedStatus && (
            <p>
              <strong>Estado actual:</strong> {computedStatus}
            </p>
          )}
          {initialData._id && (
            <>
              <p>
                <strong>Pagados:</strong> {occupiedSpots}
              </p>
              <p>
                <strong>Cupos disponibles:</strong> {availableSpots}
              </p>
            </>
          )}
        </div>
      )}

      <div className="button-group">
        <button className="boton-agregar" type="submit" disabled={isSaving}>
          {isSaving ? "Guardando..." : "✅ Guardar"}
        </button>
        <button
          className="boton-eliminar"
          type="button"
          onClick={onCancel}
          disabled={isSaving}
        >
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default ResetEditionForm;