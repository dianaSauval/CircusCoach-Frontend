export default function validateFormationForm(formData) {
  const errors = {};
  const missingLanguages = [];

  // Validar solo español como obligatorio
  if (!formData.title?.es?.trim()) {
    errors["title-es"] = "El título en español es obligatorio";
    missingLanguages.push("es");
  }

  if (!formData.description?.es?.trim()) {
    errors["description-es"] = "La descripción en español es obligatoria";
    missingLanguages.push("es");
  }

  // Validar precio
  if (formData.price === undefined || formData.price === null || formData.price === "") {
    errors.price = "El precio es obligatorio";
  } else if (isNaN(formData.price) || formData.price < 0) {
    errors.price = "El precio debe ser un número válido";
  }

    // Validar imagen en español
  if (!formData.image?.es?.trim()) {
    errors["image-es"] = "La imagen de presentación en español es obligatoria";
  }

  return { errors, missingLanguages };
}
