// pages/ShopPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import { getAllPhysicalProducts } from "../services/physicalProductService";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import EmptyState from "../components/EmptyState/EmptyState";
import "../styles/pages/ShopPage.css";
import { getBooks } from "../services/bookService";
import { useCart } from "../context/CartContext";

// ✅ nuevos componentes
import ShopProductCard from "../components/shop/ShopProductCard";
import ShopBookCard from "../components/shop/ShopBookCard";

export default function ShopPage() {
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const t = translations.shop?.[language] || translations.shop?.es;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  const fetchBooks = async () => {
    try {
      setLoadingBooks(true);
      const data = await getBooks();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error getBooks:", err);
      setBooks([]);
    } finally {
      setLoadingBooks(false);
    }
  };

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
    fetchBooks();
  }, []);

  const handleAddBook = (book) => {
    addToCart({
      type: "book",
      id: book._id,
      title: book.title,
      image: book.coverImage?.url || "",
      price: Number(book.price) || 0,
    });
  };

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

      {/* =========================
          🛍️ Productos físicos
         ========================= */}
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
            {products.map((p) => (
              <ShopProductCard
                key={p._id}
                product={p}
                language={language}
                t={t}
              />
            ))}
          </div>
        )}
      </section>

      {/* =========================
          📚 Libros (eBooks)
         ========================= */}
      <section className="shop-content shop-books" style={{ marginTop: 36 }}>
        <h2 className="titulo-principal" style={{ fontSize: "1.8rem" }}>
          {t?.booksTitle || "Libros"}
        </h2>

        <p className="texto" style={{ marginTop: 8 }}>
          {t?.booksSubtitle || "eBooks en PDF para ver online o descargar."}
        </p>

        {loadingBooks ? (
          <div className="shop-loading">
            <LoadingSpinner />
            <p className="texto">{t?.loadingBooks || "Cargando libros..."}</p>
          </div>
        ) : books.length === 0 ? (
          <div className="shop-empty">
            <EmptyState
              title={t?.booksEmptyTitle || "Todavía no hay libros disponibles"}
              subtitle={
                t?.booksEmptySubtitle ||
                "Próximamente habrá nuevos títulos disponibles. Revisá esta sección más adelante."
              }
            />
          </div>
        ) : (
          <div className="shop-grid">
            {books.map((b) => (
              <ShopBookCard
                key={b._id}
                book={b}
                t={t}
                onAddToCart={handleAddBook}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
