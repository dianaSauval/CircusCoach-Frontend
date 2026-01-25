// components/shop/ShopProductCard.jsx
import { useMemo } from "react";

const pickLangText = (field, lang) => {
  if (!field || typeof field !== "object") return "";
  const current = (field[lang] || "").trim();
  if (current) return current;

  return (
    (field.es || "").trim() ||
    (field.en || "").trim() ||
    (field.fr || "").trim() ||
    ""
  );
};

export default function ShopProductCard({ product, language, t }) {
  const title = useMemo(
    () => pickLangText(product?.title, language),
    [product, language]
  );

  const description = useMemo(
    () => pickLangText(product?.description, language),
    [product, language]
  );

  const inStock = Number(product?.stock || 0) > 0;

  return (
    <article className="shop-card" key={product?._id}>
      <div className="shop-img-wrap">
        <img
          src={product?.imageUrl}
          alt={title || "Producto"}
          loading="lazy"
        />

        <div
          className={`shop-stock-badge ${inStock ? "in" : "out"}`}
          title={inStock ? `${t?.stock}: ${product?.stock}` : t?.outOfStock}
        >
          {inStock ? `${t?.stock}: ${product?.stock}` : t?.outOfStock}
        </div>
      </div>

      <div className="shop-card-body">
        <h2 className="shop-card-title">{title || "Producto"}</h2>

        {description ? (
          <p className="shop-card-desc">{description}</p>
        ) : (
          <p className="shop-card-desc muted"> </p>
        )}

        <div className="shop-meta">
          <div className="shop-price">
            <span className="shop-meta-label">{t?.priceFrom}</span>
            <span className="shop-meta-value">
              €{Number(product?.priceEur || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="shop-actions">
          {/* ✅ Link externo: usar <a> */}
          <a
            className={`boton-principal shop-amazon-btn ${
              !product?.amazonUrl ? "disabled" : ""
            }`}
            href={product?.amazonUrl || "#"}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!product?.amazonUrl}
            onClick={(e) => {
              if (!product?.amazonUrl) e.preventDefault();
            }}
          >
            {t?.viewOnAmazon}
          </a>
        </div>
      </div>
    </article>
  );
}
