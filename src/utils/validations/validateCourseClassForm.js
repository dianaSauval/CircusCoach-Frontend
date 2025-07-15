export default function validateCourseClassForm(formData) {
  const errors = {};

  // 🔤 Validación obligatoria solo para campos en español
  if (!formData.title?.es?.trim()) {
    errors.title = "El título en español es obligatorio";
  }

  if (!formData.content?.es?.trim()) {
    errors.content = "El contenido en español es obligatorio";
  }

  return errors;
}
