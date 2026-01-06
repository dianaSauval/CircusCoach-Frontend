const hasAnyLang = (obj) => {
  if (!obj || typeof obj !== "object") return false;
  return Boolean(
    obj.es?.trim() || obj.en?.trim() || obj.fr?.trim()
  );
};

const validatePhysicalProductForm = (data) => {
  const errors = {};

  // title multi-idioma: al menos uno debe estar completo
  if (!hasAnyLang(data.title)) {
    errors.title = "El título es obligatorio (completalo al menos en un idioma).";
  }

  if (!data.imageUrl?.trim()) {
    errors.imageUrl = "La URL de imagen es obligatoria.";
  }

  if (!data.amazonUrl?.trim()) {
    errors.amazonUrl = "El link de Amazon es obligatorio.";
  }

  const price = Number(data.priceEur);
  if (Number.isNaN(price) || price < 0) {
    errors.priceEur = "El precio debe ser un número válido (>= 0).";
  }

  const stockNum = Number(data.stock);
  if (Number.isNaN(stockNum) || stockNum < 0) {
    errors.stock = "El stock debe ser un número entero (>= 0).";
  } else if (!Number.isInteger(stockNum)) {
    errors.stock = "El stock debe ser un número entero.";
  }

  return errors;
};

export default validatePhysicalProductForm;
