export default function validateCourseForm(formData) {
  const errors = {};

  // Título en español
  if (!formData.title?.es?.trim()) {
    errors.title = "El título en español es obligatorio";
  }

  // Descripción en español
  if (!formData.description?.es?.trim()) {
    errors.description = "La descripción en español es obligatoria";
  }

  // Precio
  const price = parseFloat(formData.price);
  if (isNaN(price) || price <= 0) {
    errors.price = "El precio debe ser un número mayor a cero";
  }

  // Imagen en español
  if (!formData.image?.es?.trim()) {
    errors.image = "La imagen de presentación en español es obligatoria";
  }

  return errors;
}
