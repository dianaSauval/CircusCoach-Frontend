import "./Card.css";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../i18n/translations";

const Card = ({
  data = {}, // ✅ Fallback seguro
  onClick,
  visible = true,
  expirado = false,
  fechaExpiracion = null,
  onRebuy = null,
}) => {
  const { language } = useLanguage();
  const t = translations.myCourses[language];

  const image = data?.image;
  const description = data?.description;

  const selectedImage =
    typeof image === "string" ? image : image?.[language] || image?.es || null;

  const selectedDescription =
    typeof description === "string"
      ? description
      : description?.[language] || description?.es || "";

  function truncateText(text, maxLength = 120) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    return truncated.slice(0, lastSpace) + "...";
  }

  function getTiempoRestanteTexto(fechaExpiracion) {
    if (!fechaExpiracion || expirado) return null;

    const ahora = new Date();
    const expira = new Date(fechaExpiracion);
    const msRestantes = expira - ahora;

    if (msRestantes <= 0) return null;

    const dias = Math.floor(msRestantes / (1000 * 60 * 60 * 24));
    if (dias > 30) return null;

    if (dias >= 28) return t.timeLeft_oneMonth;
    if (dias >= 21) return t.timeLeft_threeWeeks;
    if (dias >= 14) return t.timeLeft_twoWeeks;
    if (dias >= 7) return t.timeLeft_oneWeek;
    if (dias > 1) return t.timeLeft_days.replace("{{days}}", dias);
    if (dias === 1) return t.timeLeft_lastDay;

    return null;
  }

  const tiempoRestante = fechaExpiracion ? getTiempoRestanteTexto(fechaExpiracion) : null;

  const mostrarOverlay = (expirado || !visible) && (t.expiredMessage || t.notAvailableInLanguage);
  const overlayTexto = expirado ? t.expiredMessage : t.notAvailableInLanguage;

  return (
    <div
      className={`custom-card ${!visible || expirado ? "card-disabled" : ""}`}
      onClick={visible && !expirado ? onClick : undefined}
      style={{
        cursor: visible && !expirado && onClick ? "pointer" : "default",
      }}
    >
      <div className="card-image-wrapper">
        {selectedImage && (
          <img
            src={selectedImage}
            alt="Imagen del curso o formación"
            className="custom-card-img"
          />
        )}

        {tiempoRestante && (
          <div className="tiempo-restante-badge">{tiempoRestante}</div>
        )}
      </div>

      <div className="custom-card-description">
        {truncateText(selectedDescription)}
      </div>

      {mostrarOverlay && (
        <div className="card-overlay">
          <div>
            <p>{overlayTexto}</p>
            {expirado && typeof onRebuy === "function" && (
              <button
                className="boton-secundario rebuy-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRebuy(data);
                }}
              >
                {t.rebuyButton}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
