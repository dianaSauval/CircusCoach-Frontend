import { useMemo } from "react";
import "./ServiceCard.css";

const serviceImages = {
  reset:
    "https://res.cloudinary.com/dkdhdy9e5/image/upload/v1774885652/CircusCoach/imagen_reducida_1_grrdop.jpg",
  coaching:
    "https://res.cloudinary.com/dkdhdy9e5/image/upload/v1774885505/CircusCoach/imagen_reducida_nmxix0.jpg",
  "artistic-direction":
    "https://res.cloudinary.com/dkdhdy9e5/image/upload/v1774885651/CircusCoach/imagen_reducida_2_c31gdo.jpg",
};

const imageAltMap = {
  reset: "Programa RESET",
  coaching: "Coaching personalizado 1 a 1",
  "artistic-direction": "Dirección artística y mirada externa",
};

const badgeMap = {
  reset: "Programa grupal",
  coaching: "Sesiones 1:1",
  "artistic-direction": "Feedback externo",
};

function ServiceCard({
  service,
  isSelected,
  onOpenModal,
  onSelect,
  resetEditions = [],
}) {
  const formatShortDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const displayedPrices = useMemo(() => {
    if (service.id !== "reset") {
      return service.prices || [];
    }

    if (!Array.isArray(resetEditions) || resetEditions.length === 0) {
      return ["Próximas ediciones por confirmar"];
    }

    const visibleEditions = resetEditions
      .filter((edition) => edition.status === "open" || edition.status === "full")
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    if (visibleEditions.length === 0) {
      return ["Próximas ediciones por confirmar"];
    }

    const maxToShow = 3;
    const sliced = visibleEditions.slice(0, maxToShow).map((edition) => {
      return `${formatShortDate(edition.startDate)} · €${Number(
        edition.price || 0
      ).toFixed(0)}`;
    });

    if (visibleEditions.length > maxToShow) {
      sliced.push(`+${visibleEditions.length - maxToShow} ediciones más`);
    }

    return sliced;
  }, [service, resetEditions]);

  const imageSrc = serviceImages[service.id];
  const imageAlt = imageAltMap[service.id] || service.title;
  const badgeText = badgeMap[service.id];

  return (
    <article
      className={`consultoria-card ${
        isSelected ? "consultoria-card--selected" : ""
      }`}
    >
      {imageSrc && (
        <div
          className={`consultoria-card__image consultoria-card__image--${service.id}`}
        >
          <img src={imageSrc} alt={imageAlt} loading="lazy" />
          <div className="consultoria-card__image-overlay" />
          {badgeText && (
            <span className="consultoria-card__badge">{badgeText}</span>
          )}
        </div>
      )}

      <div className="consultoria-card__body">
        <div>
          <h3>{service.title}</h3>
          <p className="consultoria-card__subtitle">{service.subtitle}</p>

          <p className="consultoria-card__description">{service.shortText}</p>

          <div className="consultoria-card__prices">
            <h4>{service.id === "reset" ? "Próximas ediciones" : "Precios"}</h4>

            <div className="consultoria-price-list">
              {displayedPrices.map((price) => (
                <div key={price} className="consultoria-price-pill">
                  {price}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="consultoria-card__actions">
          <button
            type="button"
            className="consultoria-btn consultoria-btn--ghost"
            onClick={() => onOpenModal(service)}
          >
            Leer más
          </button>

          <button
            type="button"
            className="consultoria-btn consultoria-btn--primary"
            onClick={() => onSelect(service.id)}
          >
            {service.buttonText}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ServiceCard;