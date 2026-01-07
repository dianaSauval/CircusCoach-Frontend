import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import { getAllPhysicalProducts } from "../services/physicalProductService";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import EmptyState from "../components/EmptyState/EmptyState";
import "../styles/pages/ShopPage.css";

const pickLangText = (field, lang) => {
  if (!field || typeof field !== "object") return "";
  const current = (field[lang] || "").trim();
  if (current) return current;

  // fallback: es -> en -> fr (o el orden que prefieras)
  return (
    (field.es || "").trim() ||
    (field.en || "").trim() ||
    (field.fr || "").trim() ||
    ""
  );
};

export default function ShopPage() {
  const { language } = useLanguage();
  const t = translations.shop?.[language] || translations.shop?.es;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllPhysicalProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error getAllPhysicalProducts:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const hasProducts = products.length > 0;

  const seoTitle = useMemo(() => {
    const base = t?.title || "Tienda";
    return `${base} | CircusCoach`;
  }, [t]);

  return (
    <main className="shop-page">
      <Helmet>
        <title>{seoTitle}</title>
        <meta
          name="description"
          content={(t?.intro || "").replace(/\n/g, " ").slice(0, 155)}
        />
      </Helmet>

      <section className="shop-hero">
        <h1 className="titulo-principal">{t?.title}</h1>

        <p className="shop-intro texto">
          {(t?.intro || "")
            .split("\n")
            .filter(Boolean)
            .map((p, idx) => (
              <span key={idx}>
                {p}
                <br />
                <br />
              </span>
            ))}
        </p>
      </section>

      <section className="shop-content">
        {loading ? (
          <div className="shop-loading">
            <LoadingSpinner />
            <p className="texto">{t?.loading}</p>
          </div>
        ) : !hasProducts ? (
          <div className="shop-empty">
            <EmptyState title={t?.emptyTitle} subtitle={t?.emptySubtitle} />
          </div>
        ) : (
          <div className="shop-grid">
            {products.map((p) => {
              const title = pickLangText(p.title, language);
              const description = pickLangText(p.description, language);
              const inStock = Number(p.stock || 0) > 0;

              return (
                <article className="shop-card" key={p._id}>
                  <div className="shop-img-wrap">
                    <img
                      src={p.imageUrl}
                      alt={title || "Producto"}
                      loading="lazy"
                    />

                    <div
                      className={`shop-stock-badge ${inStock ? "in" : "out"}`}
                      title={
                        inStock ? `${t?.stock}: ${p.stock}` : t?.outOfStock
                      }
                    >
                      {inStock ? `${t?.stock}: ${p.stock}` : t?.outOfStock}
                    </div>
                  </div>

                  <div className="shop-card-body">
                    <h2 className="shop-card-title">{title}</h2>

                    {description ? (
                      <p className="shop-card-desc">{description}</p>
                    ) : (
                      <p className="shop-card-desc muted"> </p>
                    )}

                    <div className="shop-meta">
                      <div className="shop-price">
                        <span className="shop-meta-label">{t?.priceFrom}</span>
                        <span className="shop-meta-value">
                          €{Number(p.priceEur || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="shop-actions">
                      <a
                        className={`boton-principal shop-amazon-btn ${
                          !p.amazonUrl ? "disabled" : ""
                        }`}
                        href={p.amazonUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-disabled={!p.amazonUrl}
                        onClick={(e) => {
                          if (!p.amazonUrl) e.preventDefault();
                        }}
                      >
                        {t?.viewOnAmazon}
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
