import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../services/courseService";
import "../styles/pages/DetailLayout.css";
import "../styles/pages/CourseDetail.css";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import EmptyState from "../components/EmptyState/EmptyState";
import { getYoutubeEmbedUrl } from "../utils/youtube";
import InternationalPriceCard from "../components/InternationalPriceCard/InternationalPriceCard";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

function CourseDetail() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const { language: lang } = useLanguage();
  const tc = translations.courseDetail[lang];

  const [course, setCourse] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [idiomaNoDisponible, setIdiomaNoDisponible] = useState(false);
  const [idiomasDisponibles, setIdiomasDisponibles] = useState([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourseById(id, lang);

        // si no está visible en este idioma
        if (!data.visible?.[lang]) {
          setIdiomaNoDisponible(true);
          const langs = Object.entries(data.visible || {})
            .filter(([_, visible]) => visible)
            .map(([idioma]) => idioma.toUpperCase());
          setIdiomasDisponibles(langs);
        } else {
          setCourse(data);
          setIdiomaNoDisponible(false);
          const langs = Object.entries(data.visible || {})
            .filter(([_, visible]) => visible)
            .map(([idioma]) => idioma.toUpperCase());
          setIdiomasDisponibles(langs);
        }
      } catch (error) {
        console.error("Error al obtener detalles del curso:", error);
      }
    };

    fetchCourse();
  }, [id, lang]);

  // Redirige si el slug no coincide con el título actual
  useEffect(() => {
    if (course?.title?.[lang]) {
      const expectedSlug = course.title[lang]
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      if (slug !== expectedSlug) {
        navigate(`/courses/${id}/${expectedSlug}`, { replace: true });
      }
    }
  }, [course, slug, id, lang, navigate]);

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = course?.pdf?.[lang];
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (idiomaNoDisponible) {
    return (
      <EmptyState
        title={`😢 ${tc.unavailableTitle}`}
        subtitle={tc.unavailable.replace(
          "{{lang}}",
          tc.languageNames[lang] || lang.toUpperCase()
        )}
      />
    );
  }

  if (!course) return <LoadingSpinner texto={tc.loading} />;

  const embedUrl = course.video?.[lang]
    ? getYoutubeEmbedUrl(course.video[lang])
    : null;

  return (
    <>
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
          {embedUrl && showVideo ? (
            <iframe
              className="video-iframe"
              src={embedUrl}
              title="Video del curso"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          ) : (
            <div
              className="image-container"
              onClick={() => setShowVideo(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setShowVideo(true)}
            >
              <img
                src={course.image?.[lang]}
                alt="Imagen del curso"
                className="formation-image"
              />
              {embedUrl && <div className="play-overlay">▶️</div>}
            </div>
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

      <InternationalPriceCard isCourse={true} course={course} />
    </>
  );
}

export default CourseDetail;
