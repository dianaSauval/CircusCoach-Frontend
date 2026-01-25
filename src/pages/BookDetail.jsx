// pages/BookDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../styles/pages/BookDetail.css";

import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import EmptyState from "../components/EmptyState/EmptyState";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

import { getBookBySlug } from "../services/bookService";

export default function BookDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { language } = useLanguage();

  const t =
    translations.bookDetail?.[language] || translations.bookDetail?.es || {};
  const tShop = translations.shop?.[language] || translations.shop?.es || {};

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const data = await getBookBySlug(slug);
      setBook(data || null);
    } catch (err) {
      console.error("❌ Error getBookBySlug:", err);
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    fetchBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const cover = book?.coverImage?.url || "/img/placeholder-book.jpg";
  const title = (book?.title || "").trim();
  const description = (book?.description || "").trim();
  const price = Number(book?.price || 0);
  const bookLang = book?.language || "es"; // "es" | "en" | "fr"
  const bookLangLabel = t?.langName?.[bookLang] || bookLang.toUpperCase();

  const seoTitle = useMemo(() => {
    const base = title || t?.fallbackTitle || "Libro";
    return `${base} | CircusCoach`;
  }, [title, t]);

  const seoDesc = useMemo(() => {
    const base = description || t?.fallbackDesc || "";
    return base.replace(/\n/g, " ").slice(0, 155);
  }, [description, t]);

  const handleAddToCart = () => {
    if (!book?._id) return;
    addToCart({
      type: "book",
      id: book._id,
      title: book.title,
      image: book.coverImage?.url || "",
      price: Number(book.price) || 0,
    });
    navigate("/pago-embed");
  };

  return (
    <main className="book-detail-page">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
      </Helmet>

      {loading ? (
        <div className="book-detail-loading">
          <LoadingSpinner />
          <p className="texto">{t?.loading || "Cargando libro..."}</p>
        </div>
      ) : !book ? (
        <div className="book-detail-empty">
          <EmptyState
            title={t?.notFoundTitle || "No encontramos este libro"}
            subtitle={
              t?.notFoundSubtitle ||
              "Es posible que haya sido removido o que el enlace esté mal."
            }
          />
        </div>
      ) : (
        <section className="book-detail-container">
          <button
            type="button"
            className="book-back-btn"
            onClick={() => navigate(-1)}
            aria-label={t?.back || "Volver"}
          >
            <span className="book-back-icon" aria-hidden="true">
              ←
            </span>
            <span className="book-back-text">{t?.back || "Volver"}</span>
          </button>

          <div className="book-detail-grid">
            {/* Imagen / portada */}
            <aside className="book-cover-card">
              <div className="book-cover-wrap">
                <img
                  src={cover}
                  alt={title || "Libro"}
                  className="book-cover-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="book-price-box">
                <div className="book-price-row">
                  <span className="book-price-label">
                    {tShop?.priceFrom || "Precio"}
                  </span>
                  <span className="book-price-value">€{price.toFixed(2)}</span>
                </div>
                {/* ✅ Idioma del libro */}
                <div className="book-price-row">
                  <span className="book-price-label">
                    {t?.languageLabel || "Idioma"}
                  </span>
                  <span className="book-price-value">{bookLangLabel}</span>
                </div>
                <button
                  className="boton-principal book-cta"
                  onClick={handleAddToCart}
                >
                  {tShop?.addToCart || "Agregar al carrito"}
                </button>

                <p className="book-note">
                  {t?.note ||
                    "El PDF se habilita en “Mis cursos” una vez que se confirma la compra."}
                </p>
              </div>
            </aside>

            {/* Contenido */}
            <article className="book-info-card">
              <h1 className="titulo-principal book-title">
                {title || t?.fallbackTitle || "Libro"}
              </h1>

              {description ? (
                <div className="book-description texto">
                  {description
                    .split("\n")
                    .filter(Boolean)
                    .map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                </div>
              ) : (
                <p className="texto muted">
                  {t?.noDescription ||
                    "Este libro todavía no tiene descripción."}
                </p>
              )}

              {/* Bloque de info útil (público) */}
              <div className="book-details-box">
                <h2 className="book-section-title">
                  {t?.includesTitle || "Qué incluye"}
                </h2>

                <ul className="book-bullets">
                  <li>
                    {t?.includes1 || "Acceso al eBook dentro de la plataforma."}
                  </li>
                  <li>
                    {t?.includes2 ||
                      "Opción de descarga del PDF una vez comprado."}
                  </li>
                  <li>
                    {t?.includes3 ||
                      "Acceso inmediato tras confirmación del pago."}
                  </li>
                </ul>

                <h2 className="book-section-title">
                  {t?.howWorksTitle || "Cómo funciona"}
                </h2>

                <ol className="book-steps">
                  <li>
                    {t?.how1 ||
                      "Comprás el libro desde la tienda o el carrito."}
                  </li>
                  <li>
                    {t?.how2 || "Se registra automáticamente en tu cuenta."}
                  </li>
                  <li>
                    {t?.how3 ||
                      "Lo encontrás en “Mis cursos” para verlo o descargarlo."}
                  </li>
                </ol>

                <div className="book-soft-warning">
                  <strong>{t?.privacyTitle || "Nota"}</strong>
                  <p>
                    {t?.privacyText ||
                      "Por seguridad, el enlace del PDF no se muestra públicamente hasta que el libro esté comprado."}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}
    </main>
  );
}
