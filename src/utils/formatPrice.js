// función auxiliar para formatear
export const formatPrice = (value, currency = "EUR", lang = "es-ES") => {
  const hasDecimals = value % 1 !== 0;

  return new Intl.NumberFormat(lang, {
    style: "currency",
    currency,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(value);
};
