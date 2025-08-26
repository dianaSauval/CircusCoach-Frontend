import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../services/courseService";
import "../styles/pages/DetailLayout.css";
import "../styles/pages/CourseDetail.css";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import EmptyState from "../components/EmptyState/EmptyState";
import { getVideoEmbedUrl } from "../utils/videoEmbed";
import InternationalPriceCard from "../components/InternationalPriceCard/InternationalPriceCard";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import { getActiveDiscounts } from "../services/discountService";
import DiscountBanner from "../components/common/DiscountBanner/DiscountBanner";

// Normaliza booleans por si vienen como string
const toBool = (v) => v === true || v === "true";

function CourseDetail() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const { language: lang } = useLanguage();
  const tc = translations.courseDetail[lang];

  const [course, setCourse] = useState(null);
  const [idiomaNoDisponible, setIdiomaNoDisponible] = useState(false);
  const [idiomasDisponibles, setIdiomasDisponibles] = useState([]);
  const [bonoDelCurso, setBonoDelCurso] = useState(null);
  const [loading, setLoading] = useState(true);

  // Normaliza booleans por si vienen como string
  const toBool = (v) => v === true || v === "true";

  useEffect(() => {
    let cancelled = false;

    // 🔄 limpiar estado al cambiar id/lang para evitar flashes del idioma previo
    setLoading(true);
    setCourse(null);
    setIdiomaNoDisponible(false);
    setIdiomasDisponibles([]);
    setBonoDelCurso(null);

    const fetchCourse = async () => {
      try {
        const data = await getCourseById(id, lang);
        if (cancelled) return;

        // idiomas visibles (true/"true")
        const visibles = Object.entries(data.visible || {})
          .filter(([, v]) => toBool(v))
          .map(([k]) => k.toUpperCase());
        setIdiomasDisponibles(visibles);

        // ⛔ si NO está visible en el idioma actual => solo EmptyState
        if (!toBool(data.visible?.[lang])) {
          setIdiomaNoDisponible(true);
          return;
        }

        // ✅ visible en el idioma actual => setear curso + descuentos
        setCourse(data);

        const descuentos = await getActiveDiscounts();

        const matchById = (d, courseId) => {
          const cid = String(courseId);
          const inItems =
            Array.isArray(d.targetItems) &&
            d.targetItems.some((it) => String(it?._id) === cid);
          const inIds =
            Array.isArray(d.targetIds) &&
            d.targetIds.some((id) => String(id) === cid);
          return inItems || inIds;
        };

        const bonoAplicable = descuentos.find(
          (d) =>
            (d.type === "course" || d.type === "both") && matchById(d, data._id)
        );

        setBonoDelCurso(bonoAplicable || null);
      } catch (err) {
        if (cancelled) return;

        const status = err?.response?.status;

        if (status === 403) {
          // 🔐 El backend te está diciendo "no visible en este idioma"
          // Intentamos leer idiomas visibles si el backend los manda:
          const visibleFromError = err.response?.data?.visible;
          if (visibleFromError && typeof visibleFromError === "object") {
            const visibles = Object.entries(visibleFromError)
              .filter(([, v]) => toBool(v))
              .map(([k]) => k.toUpperCase());
            setIdiomasDisponibles(visibles);
          }

          setIdiomaNoDisponible(true);
        } else if (status === 404) {
          // Curso inexistente: podés redirigir a 404 si tenés ruta
          // navigate("/404", { replace: true });
          setIdiomaNoDisponible(true);
        } else {
          console.error("Error al obtener detalles del curso:", err);
          // Si querés, mostrar un EmptyState genérico:
          setIdiomaNoDisponible(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCourse();
    return () => {
      cancelled = true;
    };
  }, [id, lang]);

  // Redirección de slug SOLO si hay título en el idioma actual (o sea, visible)
  useEffect(() => {
    if (course?.title?.[lang]) {
      const expectedSlug = course.title[lang]
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      if (slug !== expectedSlug) {
        navigate(`/courses/${id}/${expectedSlug}`, { replace: true });
      }
    }
  }, [course, slug, id, lang, navigate]);

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = (course?.pdf?.[lang] || "").trim();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  // ⛔ Idioma no disponible -> SOLO EmptyState (opcional: listar idiomas disponibles)
  if (idiomaNoDisponible) {
    const disponiblesTexto =
      idiomasDisponibles.length > 0
        ? ` (${tc.availableLanguages}: ${idiomasDisponibles
            .map((code) => tc.languageNames[code.toLowerCase()] || code)
            .join(" / ")})`
        : "";

    return (
      <EmptyState
        title={`😢 ${tc.unavailableTitle}`}
        subtitle={`${tc.unavailable.replace(
          "{{lang}}",
          tc.languageNames[lang] || lang.toUpperCase()
        )}${disponiblesTexto}`}
      />
    );
  }

  // ⏳ Cargando
  if (loading || !course) return <LoadingSpinner texto={tc.loading} />;

  // 🎬 Solo contenido del idioma actual (sin fallbacks)
  const promoVideoRaw = (course.video?.[lang] || "").trim();
  const embedUrl = promoVideoRaw ? getVideoEmbedUrl(promoVideoRaw) : null;

  const imageSrc =
    (course.image?.[lang] && course.image[lang].trim()) || "/placeholder.png";

  return (
    <>
      {bonoDelCurso && (
        <DiscountBanner
          name={bonoDelCurso.name}
          endDate={bonoDelCurso.endDate}
        />
      )}

      <div className="detalle-container">
        <div className="left-section">
          <h1 className="detalle-title">{course.title?.[lang]}</h1>
          <p className="detalle-description">{course.description?.[lang]}</p>

          <button className="inscribite-button">{tc.enrollNow}</button>

          {course.pdf?.[lang] && (
            <>
              <p className="pdf-info-text">{tc.downloadInfoCurso}</p>
              <button className="descargar-button" onClick={handleDownload}>
                {tc.downloadButton}
              </button>
            </>
          )}

          {idiomasDisponibles.length > 0 && (
            <p className="detalle-idiomas">
              🌐 {tc.availableLanguages}:{" "}
              {idiomasDisponibles
                .map((code) => tc.languageNames[code.toLowerCase()] || code)
                .join(" / ")}
            </p>
          )}
        </div>

        <div className="right-column">
          {embedUrl ? (
            <iframe
              className="video-iframe"
              src={embedUrl}
              title="Video promocional del curso"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <img
              src={imageSrc}
              alt={course.title?.[lang] || "Imagen del curso"}
              className="course-detail-image"
              loading="lazy"
            />
          )}
        </div>
      </div>

      <div className="detalle-caracteristicas">
        <div className="caracteristica">
          <i className="fas fa-wifi"></i>
          <span>{tc.feature_online}</span>
        </div>
        <div className="caracteristica">
          <i className="fas fa-file-download"></i>
          <span>{tc.feature_downloadable}</span>
        </div>
        <div className="caracteristica">
          <i className="fas fa-comments"></i>
          <span>{tc.feature_support}</span>
        </div>
      </div>

      <InternationalPriceCard
        isCourse={true}
        course={course}
        discount={bonoDelCurso}
      />
    </>
  );
}

export default CourseDetail;
