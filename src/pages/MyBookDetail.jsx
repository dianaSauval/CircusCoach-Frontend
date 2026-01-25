// pages/MyBookDetail.jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import EmptyState from "../components/EmptyState/EmptyState";
import { getBookById, getBookFile } from "../services/bookService";
import "../styles/pages/MyBookDetail.css";

export default function MyBookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const t =
    translations.myBookDetail?.[language] ||
    translations.myBookDetail?.es ||
    {};
  const fechaExpiracion = location.state?.fechaExpiracion || null;

  const [book, setBook] = useState(null);
  const [fileInfo, setFileInfo] = useState(null); // { url, downloadable, viewOnline }
  const [loading, setLoading] = useState(true);
  const [loadingFile, setLoadingFile] = useState(true);

  // ✅ Descripción: párrafos + ver más/menos + anti-scroll-jump + animación suave
  const [descExpanded, setDescExpanded] = useState(false);
  const toggleRef = useRef(null);
  const scrollFixRef = useRef({ pending: false, topBefore: 0 });

  const MAX_DESC_CHARS = 380;

  const rawDesc = (book?.description || "").trim();

  const descParagraphs = useMemo(() => {
    return rawDesc
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
  }, [rawDesc]);

  const isLongDesc = rawDesc.length > MAX_DESC_CHARS;

  const visibleParagraphs = useMemo(() => {
    if (descExpanded || !isLongDesc) return descParagraphs;

    let count = 0;
    const out = [];

    for (let i = 0; i < descParagraphs.length; i++) {
      const p = descParagraphs[i];

      // Si el próximo párrafo excede el límite, recortamos y agregamos "…"
      if (count + p.length > MAX_DESC_CHARS) {
        const remaining = MAX_DESC_CHARS - count;

        if (remaining > 40) {
          out.push(p.slice(0, remaining).trim() + "…");
        } else if (out.length) {
          out[out.length - 1] = (out[out.length - 1] || "").trim() + "…";
        } else {
          out.push(p.slice(0, Math.max(0, remaining)).trim() + "…");
        }
        break;
      }

      out.push(p);
      count += p.length + 1;
    }

    return out;
  }, [descExpanded, isLongDesc, descParagraphs]);

  const handleToggleDesc = () => {
    const el = toggleRef.current;
    if (!el) return;

    // Guardamos la posición del botón en pantalla antes del cambio
    scrollFixRef.current.pending = true;
    scrollFixRef.current.topBefore = el.getBoundingClientRect().top;

    setDescExpanded((v) => !v);
  };

  // ✅ Corrección de scroll "a prueba de saltos" (sirve para ver más y ver menos)
  useLayoutEffect(() => {
    if (!scrollFixRef.current.pending) return;

    const el = toggleRef.current;
    if (!el) {
      scrollFixRef.current.pending = false;
      return;
    }

    const topAfter = el.getBoundingClientRect().top;
    const delta = topAfter - scrollFixRef.current.topBefore;

    if (Math.abs(delta) > 1) window.scrollBy(0, delta);

    scrollFixRef.current.pending = false;
  }, [descExpanded]);

  const seoTitle = useMemo(() => {
    const title = (book?.title || "").trim();
    return title ? `${title} | CircusCoach` : `Libro | CircusCoach`;
  }, [book]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const data = await getBookById(id);
        setBook(data);
      } catch (e) {
        console.error("❌ Error getBookById:", e);
        setBook(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchFile = async () => {
      try {
        setLoadingFile(true);
        const info = await getBookFile(id);
        setFileInfo(info);
      } catch (e) {
        console.error("❌ Error getBookFile:", e);
        setFileInfo(null);
      } finally {
        setLoadingFile(false);
      }
    };

    if (id) {
      fetchBook();
      fetchFile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="my-book-detail-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="my-book-detail-empty">
        <EmptyState
          title={t.notFoundTitle || "Libro no encontrado"}
          subtitle={
            t.notFoundSubtitle || "No pudimos cargar la información del libro."
          }
        />
      </div>
    );
  }

  const canView = !!fileInfo?.url && !!fileInfo?.viewOnline;
  const canDownload = !!fileInfo?.url && !!fileInfo?.downloadable;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="my-book-detail-page">
        <button className="boton-secundario" onClick={() => navigate(-1)}>
          ← {t.back || "Volver"}
        </button>

        <section className="my-book-detail-header">
          <div className="my-book-cover">
            {book.coverImage?.url ? (
              <img src={book.coverImage.url} alt={book.title || "Portada"} />
            ) : (
              <div className="my-book-cover-empty">
                {t.noCover || "Sin portada"}
              </div>
            )}
          </div>

          <div className="my-book-info">
            <h1 className="titulo-principal my-book-title">
              {book.title || "Sin título"}
            </h1>

            {rawDesc ? (
              <div className="my-book-desc texto">
                <div
                  className={`my-book-desc-content ${descExpanded ? "expanded" : "collapsed"}`}
                >
                  {visibleParagraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {isLongDesc && (
                  <button
                    ref={toggleRef}
                    type="button"
                    className="my-book-desc-toggle"
                    onClick={handleToggleDesc}
                  >
                    <span className="toggle-text">
                      {descExpanded
                        ? t.seeLess || "Ver menos"
                        : t.seeMore || "Ver más"}
                    </span>
                    <span
                      className={`toggle-icon ${descExpanded ? "open" : ""}`}
                    >
                      ▾
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <p className="texto my-book-desc muted">
                {t.noDescription || "Sin descripción."}
              </p>
            )}

            {fechaExpiracion && (
              <p className="my-book-exp">
                {t.expires || "Acceso hasta"}:{" "}
                <strong>
                  {new Date(fechaExpiracion).toLocaleDateString()}
                </strong>
              </p>
            )}

            <div className="my-book-actions">
              {loadingFile ? (
                <span className="my-book-file-loading">
                  {t.loadingFile || "Cargando archivo…"}
                </span>
              ) : (
                <>
                  {canDownload && (
                    <a
                      className="boton-principal"
                      href={fileInfo.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t.download || "Descargar PDF"}
                    </a>
                  )}

                  {!canDownload && (
                    <span className="my-book-note">
                      {t.downloadDisabled ||
                        "La descarga no está habilitada para este contenido."}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        <section className="my-book-viewer">
          <h2 className="subtitulo">{t.viewerTitle || "Lectura online"}</h2>

          {loadingFile ? (
            <div className="my-book-detail-loading">
              <LoadingSpinner />
            </div>
          ) : canView ? (
            <div className="my-book-pdf-frame">
              <iframe title="PDF" src={fileInfo.url} />
            </div>
          ) : (
            <EmptyState
              title={t.viewerDisabledTitle || "Lectura online no disponible"}
              subtitle={
                t.viewerDisabledSubtitle ||
                "Este archivo no está habilitado para visualizarse online."
              }
            />
          )}
        </section>
      </main>
    </>
  );
}
