export default function validateFormationClassForm(formData) {
  const errors = {};
  const missingLanguages = [];

  // Validar título en español
  if (!formData.title?.es?.trim()) {
    errors["title-es"] = "El título en español es obligatorio";
    missingLanguages.push("es");
  }

  // Validar contenido en español
  if (!formData.content?.es?.trim()) {
    errors["content-es"] = "El contenido en español es obligatorio";
    if (!missingLanguages.includes("es")) missingLanguages.push("es");
  }

 return { errors, missingLanguages };
}
