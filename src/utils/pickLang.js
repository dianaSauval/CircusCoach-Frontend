export const pickLangWithSpanishFallback = (value, lang = "es") => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";

  const current = (value?.[lang] || "").trim();
  if (current) return current;

  const es = (value?.es || "").trim();
  if (es) return es;

  const any = (value?.en || "").trim() || (value?.fr || "").trim();
  return any || "";
};
