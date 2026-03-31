import { useEffect, useMemo } from "react";
import "./ServiceDetailsModal.css";

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

function ServiceDetailsModal({
  service,
  isOpen,
  onClose,
  onSelect,
  resetEditions = [],
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const formatShortDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const displayedPrices = useMemo(() => {
    if (!service || service.id !== "reset") {
      return service?.prices || [];
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

    return visibleEditions.map(
      (edition) =>
        `${edition.title} — ${formatShortDate(edition.startDate)} — €${Number(
          edition.price || 0
        ).toFixed(2)}`
    );
  }, [service, resetEditions]);

  if (!isOpen || !service) return null;

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("consultoria-modal")) {
      onClose();
    }
  };

  const imageSrc = serviceImages[service.id];
  const imageAlt = imageAltMap[service.id] || service.title;
  const badgeText = badgeMap[service.id];

  const isReset = service.id === "reset";

  return (
    <div
      className="consultoria-modal"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultoria-modal-title"
    >
      <div
        className={`consultoria-modal__content ${
          isReset
            ? "consultoria-modal__content--reset"
            : "consultoria-modal__content--split"
        }`}
      >
        <button
          type="button"
          className="consultoria-modal__close"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ×
        </button>

        {imageSrc && (
          <div
            className={`consultoria-modal__image consultoria-modal__image--${service.id}`}
          >
            <img src={imageSrc} alt={imageAlt} loading="lazy" />
            <div className="consultoria-modal__image-overlay" />
            {badgeText && (
              <span className="consultoria-modal__badge">{badgeText}</span>
            )}
          </div>
        )}

        <div className="consultoria-modal__inner">
          <div className="consultoria-modal__header">
            <h3 id="consultoria-modal-title">{service.title}</h3>
            <p className="consultoria-modal__subtitle">{service.subtitle}</p>
          </div>

          <div className="consultoria-modal__body">
            <p className="consultoria-modal__text">{service.fullText}</p>

            <div className="consultoria-modal__block">
              <h4>Incluye</h4>
              <ul>
                {service.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="consultoria-modal__block">
              <h4>{service.id === "reset" ? "Próximas ediciones" : "Precios"}</h4>

              <div className="consultoria-price-list consultoria-price-list--modal">
                {displayedPrices.map((price) => (
                  <div key={price} className="consultoria-price-pill">
                    {price}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="consultoria-modal__footer">
            <button
              type="button"
              className="consultoria-btn consultoria-btn--ghost"
              onClick={onClose}
            >
              Cerrar
            </button>

            <button
              type="button"
              className="consultoria-btn consultoria-btn--primary"
              onClick={() => {
                onSelect(service.id);
                onClose();
              }}
            >
              {service.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetailsModal;