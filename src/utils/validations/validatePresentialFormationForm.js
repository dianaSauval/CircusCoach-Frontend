// utils/validations/validatePresentialFormationForm.js

const LANGS = ["es", "en", "fr"];

export default function validatePresentialFormationForm(formData) {
  const errors = {};

  // 🔹 Campos por idioma
  const requiredPerLang = ["title", "description", "location"];

  let hasAtLeastOneCompleteLang = false;

  LANGS.forEach((lang) => {
    // ¿Hay algo escrito en este idioma?
    const hasAnyContent = requiredPerLang.some((field) => {
      const value = formData[field]?.[lang];
      return value && value.trim() !== "";
    });

    // Si no hay nada escrito en este idioma, no exigimos nada
    if (!hasAnyContent) return;

    // Si sí hay algo, exigimos que estén los 3 campos completos
    let langIsComplete = true;

    requiredPerLang.forEach((field) => {
      const value = formData[field]?.[lang];
      if (!value || value.trim() === "") {
        errors[`${field}-${lang}`] =
          "Si vas a usar este idioma, completa este campo o deja el idioma vacío.";
        langIsComplete = false;
      }
    });

    if (langIsComplete) {
      hasAtLeastOneCompleteLang = true;
    }
  });

  // Si ningún idioma quedó completo, mostramos error genérico
  if (!hasAtLeastOneCompleteLang) {
    errors["title-es"] =
      "Completa al menos un idioma con título, descripción y ubicación.";
  }

  // 🔹 Validación de fechas
  if (formData.dateType === "single") {
    if (!formData.singleDate) {
      errors.singleDate = "La fecha es obligatoria.";
    }
  } else if (formData.dateType === "range") {
    if (!formData.dateRange.start) {
      errors.rangeStart = "La fecha de inicio es obligatoria.";
    }
    if (!formData.dateRange.end) {
      errors.rangeEnd = "La fecha de fin es obligatoria.";
    }

    if (
      formData.dateRange.start &&
      formData.dateRange.end &&
      formData.dateRange.start > formData.dateRange.end
    ) {
      errors.rangeEnd =
        "La fecha de fin no puede ser anterior a la fecha de inicio.";
    }
  }

  // (Horario, link de inscripción, etc., si quisieras hacerlos obligatorios
  // también podrías validarlos acá)

  return { errors };
}
