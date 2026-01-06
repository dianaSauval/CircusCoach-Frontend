export default function validateDiscountForm(formData) {
  const errors = {};

  // ✅ Helper: al menos un idioma con contenido
  const hasAnyLang = (value) => {
    if (!value) return false;

    // compatibilidad: si viene string viejo
    if (typeof value === "string") return value.trim().length > 0;

    // multilenguaje: {es,en,fr}
    if (typeof value === "object" && !Array.isArray(value)) {
      return Boolean(
        (value.es || "").trim() ||
        (value.en || "").trim() ||
        (value.fr || "").trim()
      );
    }

    return false;
  };

  // 🔹 Nombre obligatorio (al menos en un idioma)
  if (!hasAnyLang(formData.name)) {
    errors.name = "El nombre es obligatorio (al menos en un idioma)";
  }

  // 🔹 Fechas requeridas
  if (!formData.startDate) {
    errors.startDate = "La fecha de inicio es obligatoria";
  }
  if (!formData.endDate) {
    errors.endDate = "La fecha de fin es obligatoria";
  }

  // 🔹 Fin debe ser posterior a inicio
  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) {
      errors.endDate = "La fecha de fin debe ser posterior a la de inicio";
    }
  }

  // 🔹 Descuento requerido (uno u otro, no negativos)
  const percentage = parseFloat(formData.percentage) || 0;
  const amount = parseFloat(formData.amount) || 0;

  if (percentage < 0) {
    errors.percentage = "El porcentaje no puede ser negativo";
  }

  if (amount < 0) {
    errors.amount = "El monto no puede ser negativo";
  }

  if (percentage === 0 && amount === 0) {
    errors.percentage = "Debe ingresar al menos un descuento (% o monto)";
  }

  // 🔹 Debe tener al menos un item objetivo
  if (!formData.targetItems || formData.targetItems.length === 0) {
    errors.targetItems = "Debe seleccionar al menos un curso o formación";
  }

  return errors;
}
