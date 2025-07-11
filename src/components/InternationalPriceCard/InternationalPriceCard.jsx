import "./InternationalPriceCard.css";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../i18n/translations";
import { useCart } from "../../context/CartContext";
import { useDiscount } from "../../context/DiscountContext";
import { useState } from "react";

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

  const handleAdd = () => {
    if (!item) return;

    addToCart({
      type: isCourse ? "course" : "formation",
      id: item._id,
      title: item.title,
      image: item.image,
      price: item.price,
     discount: discount || activeDiscount || null,

    });

    setShowMsg(true);
    setTimeout(() => setShowMsg(false), 2000);
  };

  const getPrecioFinal = () => {
    if (!discount) return item?.price || 0;

    if (discount.percentage > 0) {
      return item.price - (item.price * discount.percentage) / 100;
    }

    if (discount.amount > 0) {
      return Math.max(0, item.price - discount.amount);
    }

    return item.price;
  };

  const precioFinal = getPrecioFinal();

  return (
    <div className="international-card">
      <h3 className="card-title">{t.priceTitle}</h3>
      {discount && (
  <p className="nombre-del-bono">
    🎉 {discount.name?.toUpperCase()} 🎉
  </p>
)}

      <div className="precio-contenedor">
        {discount && (
          <>
            <p className="precio-original">USD {item.price}</p>
            <p className="etiqueta-descuento">
              {discount.percentage
                ? `-${discount.percentage}%`
                : `-${discount.amount} USD`}
            </p>
          </>
        )}

        <p className="card-price">
          USD {precioFinal}
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
