import "./InternationalPriceCard.css";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../i18n/translations";
import { useCart } from "../../context/CartContext";
import { useDiscount } from "../../context/DiscountContext";
import { useState, useMemo } from "react";
import { formatPrice } from "../../utils/formatPrice";
import { pickLangWithSpanishFallback } from "../../utils/pickLang";



export default function InternationalPriceCard({
  isCourse = false,
  course = null,
  formation = null,
  discount = null,
}) {
  const { language } = useLanguage();
  const t = translations.detail[language];
  const { addToCart } = useCart();
  const { activeDiscount } = useDiscount();
  const [showMsg, setShowMsg] = useState(false);

  const item = isCourse ? course : formation;

  // ⚙️ Config moneda/locale (EUR por defecto)
  const CURRENCY = "EUR";
  const localeMap = { es: "es-ES", en: "en-GB", fr: "fr-FR" };

  const fmt = useMemo(
    () =>
      new Intl.NumberFormat(localeMap[language] || "es-ES", {
        style: "currency",
        currency: CURRENCY,
        minimumFractionDigits: 2,
      }),
    [language]
  );

  const effectiveDiscount = discount || activeDiscount || null;

  const discountName = useMemo(() => {
    if (!effectiveDiscount) return "";
    return pickLangWithSpanishFallback(effectiveDiscount.name, language);
  }, [effectiveDiscount, language]);

  const handleAdd = () => {
    if (!item) return;
    addToCart({
      type: isCourse ? "course" : "formation",
      id: item._id,
      title: item.title,
      image: item.image,
      price: Number(item.price) || 0,
      discount: effectiveDiscount,
    });
    setShowMsg(true);
    setTimeout(() => setShowMsg(false), 2000);
  };

  const getPrecioFinal = () => {
    const base = Number(item?.price) || 0;
    const d = effectiveDiscount;
    if (!d) return base;

    if (d.percentage > 0) return base - (base * d.percentage) / 100;
    if (d.amount > 0) return Math.max(0, base - d.amount);

    return base;
  };

  const precioFinal = getPrecioFinal();

  return (
    <div className="international-card">
      <h3 className="card-title">{t.priceTitle}</h3>

      {effectiveDiscount && (
        <p className="nombre-del-bono">
          🎉 {(discountName || "(BONO)").toUpperCase()} 🎉
        </p>
      )}

      <div className="precio-contenedor">
        {effectiveDiscount && (
          <>
            <p className="precio-original">
              {formatPrice(
                Number(item?.price) || 0,
                "EUR",
                localeMap[language] || "es-ES"
              )}
            </p>

            <p className="etiqueta-descuento">
              {effectiveDiscount.percentage
                ? `-${effectiveDiscount.percentage}%`
                : `-${fmt.format(Number(effectiveDiscount.amount) || 0)}`}
            </p>
          </>
        )}

        <p className="card-price">
          {formatPrice(precioFinal, "EUR", localeMap[language] || "es-ES")}
        </p>
      </div>

      <ul className="card-benefits">
        <li>🎥 {t.benefit_access}</li>
        <li>📄 {t.benefit_downloadable}</li>
        <li>🕒 {t.benefit_24hs}</li>
        <li>📬 {t.benefit_support}</li>
        <li>⏳ {t.benefit_duration}</li>
      </ul>

      <button className="add-to-cart-btn" onClick={handleAdd}>
        {t.addToCart}
      </button>

      {showMsg && (
        <div className="cart-feedback-msg">
          ✅ ¡{t.addedToCart || "Agregado al carrito"}!
        </div>
      )}
    </div>
  );
}
