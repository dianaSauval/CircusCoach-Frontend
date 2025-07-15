export default function validatePresentialFormationForm(formData) {
  const errors = {};
  const missingLanguages = [];

  // Validar campos por idioma
  ["es", "en", "fr"].forEach((lang) => {
    if (!formData.title?.[lang]?.trim()) {
      errors[`title-${lang}`] = "El título es obligatorio";
      missingLanguages.push(lang);
    }
    if (!formData.description?.[lang]?.trim()) {
      errors[`description-${lang}`] = "La descripción es obligatoria";
      missingLanguages.push(lang);
    }
    if (!formData.location?.[lang]?.trim()) {
      errors[`location-${lang}`] = "La ubicación es obligatoria";
      missingLanguages.push(lang);
    }
  });

  // Validar fechas
  if (formData.dateType === "single") {
    if (!formData.singleDate) {
      errors.singleDate = "Debes seleccionar una fecha única";
    }
  } else if (formData.dateType === "range") {
    if (!formData.dateRange?.start) {
      errors.rangeStart = "La fecha de inicio es obligatoria";
    }
    if (!formData.dateRange?.end) {
      errors.rangeEnd = "La fecha de fin es obligatoria";
    }
    if (
      formData.dateRange?.start &&
      formData.dateRange?.end &&
      new Date(formData.dateRange.end) < new Date(formData.dateRange.start)
    ) {
      errors.rangeEnd = "La fecha final debe ser posterior a la inicial";
    }
  }

  return { errors, missingLanguages };
}
