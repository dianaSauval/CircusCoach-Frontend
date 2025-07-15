export default function validateModuleForm(formData) {
  const errors = {};
  const missingLanguages = [];

  // Validar título en español
  if (!formData.title?.es?.trim()) {
    errors["title-es"] = "El título en español es obligatorio";
    missingLanguages.push("es");
  }

  // Validar descripción en español
  if (!formData.description?.es?.trim()) {
    errors["description-es"] = "La descripción en español es obligatoria";
    if (!missingLanguages.includes("es")) missingLanguages.push("es");
  }

  return { errors, missingLanguages };
}
