import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/pages/DetailLayout.css";
import { getYoutubeEmbedUrl } from "../utils/youtube";
import { getFormationById } from "../services/formationService";
import { getActiveDiscounts } from "../services/discountService";
import DiscountBanner from "../components/common/DiscountBanner/DiscountBanner";
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
  const [idiomaNoDisponible, setIdiomaNoDisponible] = useState(false);
  const [idiomasDisponibles, setIdiomasDisponibles] = useState([]);
  const [bonoDeLaFormacion, setBonoDeLaFormacion] = useState(null);

  
  // 🔎 Utilidad: detecta y arma la URL de embed para YouTube/Vimeo o deja una embed ya válida
  const getGenericEmbedUrl = (urlOrId) => {
    
    if (!urlOrId) return null;

    // Si ya es un embed (player)
    if (/^(https?:)?\/\/(www\.)?(youtube\.com|youtu\.be|player\.vimeo\.com)\//i.test(urlOrId)) {
      return toEmbed(urlOrId);
    }

    // YouTube ID o url normal
    if (/^(https?:)?\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(urlOrId) || /^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
      return getYoutubeEmbedUrl(urlOrId);
    }

    // Vimeo: url o id numérico
    if (/^(https?:)?\/\/(www\.)?vimeo\.com\//i.test(urlOrId) || /^\d{6,}$/.test(urlOrId)) {
      const id = extractVimeoId(urlOrId);
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    // Último intento: si parece URL http(s), úsala por si ya es un embed válido
    if (/^https?:\/\//i.test(urlOrId)) return urlOrId;

    return null;
  };

  const toEmbed = (url) => {
    // Normaliza YouTube watch → embed
    if (/youtube\.com\/watch\?v=/.test(url)) {
      const u = new URL(url, window.location.origin);
      const v = u.searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    // Normaliza youtu.be → embed
    if (/youtu\.be\//.test(url)) {
      const id = url.split("/").pop().split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url; // player.vimeo u otros embeds ya válidos
  };



  const extractVimeoId = (val) => {
    if (!val) return null;
    if (/^\d+$/.test(val)) return val;
    const m = val.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m?.[1] || null;
  };

  useEffect(() => {
    const fetchFormation = async () => {
      setLoading(true);
      try {
        const data = await getFormationById(id, lang);

        console.log("🟦 FETCH OK");
        console.log("Idioma actual:", lang);
        console.log("formation.video completo:", data?.video);
        console.log(`formation.video[${lang}]:`, data?.video?.[lang]);
        console.log("formation.image:", data?.image);

        setFormation(data);
        setIdiomaNoDisponible(false);

        const generatedSlug = slugify(data.title?.[lang] || "", { lower: true });
        if (!slug || slug !== generatedSlug) {
          console.log("🔁 Corrigiendo slug:", { slugActual: slug, slugCorrecto: generatedSlug });
          navigate(`/formaciones/${id}/${generatedSlug}`, { replace: true });
        }

        const langs = Object.entries(data.visible || {})
          .filter(([_, visible]) => visible)
          .map(([idioma]) => idioma.toUpperCase());
        setIdiomasDisponibles(langs);

        const descuentos = await getActiveDiscounts();
        const bonoAplicable = descuentos.find(
          (d) =>
            (d.type === "formation" || d.type === "both") &&
            d.targetItems?.some((item) => item._id === data._id)
        );
        setBonoDeLaFormacion(bonoAplicable || null);
      } catch (error) {
        console.error("❌ Error al obtener la formación:", error);
        if (error.response?.status === 403) {
          setIdiomaNoDisponible(true);
          const langs = Object.entries(error.response.data?.availableLanguages || {})
            .filter(([_, visible]) => visible)
            .map(([idioma]) => idioma.toUpperCase());
          setIdiomasDisponibles(langs);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFormation();
  }, [id, lang, slug, navigate]);

  // 🧭 Elegimos el video: primero en el idioma actual, si no hay, probamos ES
  const rawVideo = useMemo(() => {
    const vLang = formation?.video?.[lang];
    const vEs = formation?.video?.es;
    const pick = vLang || vEs || null;
    if (formation) {
      console.log("🎬 Raw video elegido:", { lang, vLang, vEs, pick });
    }
    return pick;
  }, [formation, lang]);

    // añade params nice-to-have y fondo transparente al player de Vimeo
const withVimeoParams = (url) => {
  try {
    const u = new URL(url, window.location.origin);
    if (/player\.vimeo\.com\/video\//.test(u.href)) {
      const p = u.searchParams;
      // no pisamos si ya vienen definidos
      if (!p.has("badge")) p.set("badge", "0");
      if (!p.has("title")) p.set("title", "0");
      if (!p.has("byline")) p.set("byline", "0");
      if (!p.has("portrait")) p.set("portrait", "0");
      if (!p.has("dnt")) p.set("dnt", "1");
      if (!p.has("transparent")) p.set("transparent", "1"); // 👈 clave
      u.search = p.toString();
      return u.toString();
    }
  } catch {}
  return url;
};


  const embedUrl = useMemo(() => {
    const url = withVimeoParams(getGenericEmbedUrl(rawVideo));
    if (formation) {
      console.log("🔗 URL de embed final:", url);
    }
    return url;
  }, [rawVideo, formation]);

 

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
        subtitle={tc.unavailable.replace("{{lang}}", tc.languageNames[lang] || lang.toUpperCase())}
      />
    );
  }

  if (!formation) {
    return <p className="error-text">{tc.notFound}</p>;
  }

  return (
    <>
      {bonoDeLaFormacion && (
        <DiscountBanner name={bonoDeLaFormacion.name} endDate={bonoDeLaFormacion.endDate} />
      )}

      <div className="detalle-container">
        <div className="left-section">
          <h1 className="detalle-title">{formation.title?.[lang]}</h1>
          <p className="detalle-description">{formation.description?.[lang]}</p>

          <button className="inscribite-button">{tc.enrollNow}</button>

          {formation.pdf?.[lang] && (
            <>
              <p className="pdf-info-text">{tc.downloadInfo}</p>
              <button type="button" className="descargar-button" onClick={handleDownload}>
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
              style={{ backgroundColor: "transparent" }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onError={(e) => {
                console.error("🧨 Error cargando iframe:", e);
              }}
            />
          ) : (
            <img
              src={formation.image?.[lang] || formation.image?.es || "/placeholder.png"}
              alt={formation.title?.[lang] || formation.title?.es || "Formación"}
              className="formation-detail-image"
              onError={(e) => {
                console.error("🧨 Error cargando imagen de la formación:", e?.target?.src);
              }}
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

      <InternationalPriceCard isCourse={false} formation={formation} discount={bonoDeLaFormacion} />
    </>
  );
}

export default FormationDetails;
