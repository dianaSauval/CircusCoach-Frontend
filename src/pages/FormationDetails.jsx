import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/pages/DetailLayout.css";
import { getYoutubeEmbedUrl } from "../utils/youtube";
import { getFormationById } from "../services/formationService";
import { getActiveDiscounts } from "../services/discountService"; // ✅ NUEVO
import DiscountBanner from "../components/common/DiscountBanner/DiscountBanner"; // ✅ NUEVO
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import EmptyState from "../components/EmptyState/EmptyState";
import InternationalPriceCard from "../components/InternationalPriceCard/InternationalPriceCard";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import slugify from "slugify";

function FormationDetails() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const { language: lang } = useLanguage();
  const tc = translations.courseDetail[lang];

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [idiomaNoDisponible, setIdiomaNoDisponible] = useState(false);
  const [idiomasDisponibles, setIdiomasDisponibles] = useState([]);
  const [bonoDeLaFormacion, setBonoDeLaFormacion] = useState(null); // ✅ NUEVO

  useEffect(() => {
    const fetchFormation = async () => {
      try {
        const data = await getFormationById(id, lang);
        setFormation(data);
        setIdiomaNoDisponible(false);

        const generatedSlug = slugify(data.title?.[lang] || "", {
          lower: true,
        });
        if (!slug || slug !== generatedSlug) {
          navigate(`/formaciones/${id}/${generatedSlug}`, { replace: true });
        }

        const langs = Object.entries(data.visible || {})
          .filter(([_, visible]) => visible)
          .map(([idioma]) => idioma.toUpperCase());

        setIdiomasDisponibles(langs);

        // ✅ Buscar descuentos activos
        const descuentos = await getActiveDiscounts();
        const bonoAplicable = descuentos.find(
          (d) =>
            (d.type === "formation" || d.type === "both") &&
            d.targetItems?.some((item) => item._id === data._id)
        );

        setBonoDeLaFormacion(bonoAplicable || null);
      } catch (error) {
        if (error.response?.status === 403) {
          setIdiomaNoDisponible(true);
          const langs = Object.entries(
            error.response.data?.availableLanguages || {}
          )
            .filter(([_, visible]) => visible)
            .map(([idioma]) => idioma.toUpperCase());
          setIdiomasDisponibles(langs);
        } else {
          console.error("Error al obtener la formación:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFormation();
  }, [id, lang, slug, navigate]);

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (formation?.pdf?.[lang]) {
      window.open(formation.pdf[lang], "_blank", "noopener,noreferrer");
    }
  };

  if (loading) return <LoadingSpinner texto={tc.loading} />;

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

  if (!formation) {
    return <p className="error-text">{tc.notFound}</p>;
  }

  const embedUrl = formation.video?.[lang]
    ? getYoutubeEmbedUrl(formation.video[lang])
    : null;

  return (
    <>
      {bonoDeLaFormacion && (
        <DiscountBanner
          name={bonoDeLaFormacion.name}
          endDate={bonoDeLaFormacion.endDate}
        />
      )}

      <div className="detalle-container">
        <div className="left-section">
          <h1 className="detalle-title">{formation.title?.[lang]}</h1>
          <p className="detalle-description">{formation.description?.[lang]}</p>

          <button className="inscribite-button">{tc.enrollNow}</button>

          {formation.pdf?.[lang] && (
            <>
              <p className="pdf-info-text">{tc.downloadInfo}</p>
              <button
                type="button"
                className="descargar-button"
                onClick={handleDownload}
              >
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
              title="Video de la formación"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          ) : (
            <img
              src={
                formation.image?.[lang] ||
                formation.image?.es ||
                "/placeholder.png"
              }
              alt={
                formation.title?.[lang] || formation.title?.es || "Formación"
              }
              className="formation-detail-image"
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
        isCourse={false}
        formation={formation}
        discount={bonoDeLaFormacion} // ✅ PASA EL DESCUENTO
      />
    </>
  );
}

export default FormationDetails;
