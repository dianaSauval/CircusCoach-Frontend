// components/shop/ShopBookCard.jsx
import { Link } from "react-router-dom";

const shortText = (text, max = 160) => {
  const str = (text || "").trim();
  if (str.length <= max) return str;
  return str.slice(0, max).trim() + "…";
};

export default function ShopBookCard({ book, t, onAddToCart }) {
  const title = (book?.title || "").trim();
  const description = (book?.description || "").trim();
  const slug = book?.slug;

  return (
    <article className="shop-card shop-book-card" key={book?._id}>
      <div className="shop-img-wrap">
        <img
          src={book?.coverImage?.url || "/img/placeholder-book.jpg"}
          alt={title || "Libro"}
          loading="lazy"
        />
      </div>

      <div className="shop-card-body">
        <h2 className="shop-card-title">{title || "Sin título"}</h2>

        {description ? (
          <p className="shop-card-desc">{shortText(description, 160)}</p>
        ) : (
          <p className="shop-card-desc muted"> </p>
        )}

        <div className="shop-meta">
          <div className="shop-price">
            <span className="shop-meta-label">{t?.priceFrom}</span>
            <span className="shop-meta-value">
              €{Number(book?.price || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="shop-actions shop-book-actions">
          {/* ✅ Link interno: usar Link con "to" */}
          <Link className="boton-secundario" to={`/tienda/libros/${slug}`}>
            {t?.viewBook || "Ver libro"}
          </Link>

          <button
            type="button"
            className="boton-principal"
            onClick={() => onAddToCart(book)}
          >
            {t?.addToCart || "Agregar al carrito"}
          </button>
        </div>
      </div>
    </article>
  );
}
