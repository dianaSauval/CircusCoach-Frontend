import { useEffect, useRef } from "react";
import {
  FaEnvelope,
  FaWhatsapp,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import "./RequestCard.css";

const statusLabels = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
  paid: "Pagada",
};

const serviceTypeLabels = {
  reset: "RESET",
  coaching: "Coaching 1:1",
  "artistic-direction": "Dirección artística",
};

const optionLabels = {
  "reset-full-program": "RESET – Programa grupal",
  "coaching-single-session": "Sesión individual",
  "coaching-pack-4": "Pack de 4 sesiones",
  "coaching-custom": "Pack personalizado",
  "direction-video-feedback": "Feedback por video",
  "direction-live-session": "Sesión en vivo",
  "direction-creative-process": "Proceso de creación",
};

function RequestCard({
  request,
  isSelected,
  actionLoadingId,
  customPrice,
  onSelect,
  onApprove,
  onReject,
  onCustomPriceChange,
  onSetPrice,
}) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isSelected]);

  const getWhatsappHref = (phone) => {
    const normalized = phone?.replace(/\D/g, "");
    return normalized ? `https://wa.me/${normalized}` : "#";
  };

  return (
    <article
      ref={cardRef}
      className={`request-card ${isSelected ? "request-card--selected" : ""}`}
    >
      <button
        type="button"
        className="request-card__main"
        onClick={onSelect}
        aria-expanded={isSelected}
      >
        <div className="request-card__header">
          <div className="request-card__identity">
            <h2 className="request-card__name">
              {request.firstName} {request.lastName}
            </h2>
            <p className="request-card__meta">
              {serviceTypeLabels[request.serviceType] || request.serviceType}
            </p>
          </div>

          <div className="request-card__header-side">
            <span
              className={`request-card__status request-card__status--${request.status}`}
            >
              {statusLabels[request.status] || request.status}
            </span>

            <span className="request-card__toggle-icon" aria-hidden="true">
              {isSelected ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>
        </div>

        <div className="request-card__body">
          <div className="request-card__summary">
            <div className="request-card__quickdata">
              <div className="request-card__data-item request-card__data-item--contact">
                <span className="request-card__label">Email</span>
                <span className="request-card__value request-card__contact-line">
                  <FaEnvelope className="request-card__contact-icon" />
                  <span
                    className="request-card__contact-text"
                    title={request.email}
                  >
                    {request.email}
                  </span>
                </span>
              </div>

              {request.whatsapp && (
                <div className="request-card__data-item request-card__data-item--contact">
                  <span className="request-card__label">WhatsApp</span>
                  <span className="request-card__value request-card__contact-line">
                    <FaWhatsapp className="request-card__contact-icon request-card__contact-icon--whatsapp" />
                    <span
                      className="request-card__contact-text"
                      title={request.whatsapp}
                    >
                      {request.whatsapp}
                    </span>
                  </span>
                </div>
              )}

              <div className="request-card__data-item">
                <span className="request-card__label">Opción</span>
                <span className="request-card__value">
                  {optionLabels[request.selectedOption] || request.selectedOption}
                </span>
              </div>

              <div className="request-card__data-item">
                <span className="request-card__label">Idioma</span>
                <span className="request-card__value">
                  {request.language?.toUpperCase()}
                </span>
              </div>

              <div className="request-card__data-item">
                <span className="request-card__label">Precio</span>
                <span className="request-card__value">
                  {request.isCustomPrice
                    ? request.price
                      ? `€${request.price}`
                      : "A definir"
                    : `€${request.price}`}
                </span>
              </div>

              <div className="request-card__data-item">
                <span className="request-card__label">Recibida</span>
                <span className="request-card__value">
                  {new Date(request.createdAt).toLocaleString("es-ES")}
                </span>
              </div>

              {request.resetEdition && (
                <div className="request-card__data-item request-card__data-item--full">
                  <span className="request-card__label">Edición RESET</span>
                  <span className="request-card__value">
                    {request.resetEdition.title}
                  </span>
                </div>
              )}
            </div>

            {request.isWaitlist && (
              <div className="request-card__alert">
                Lista de espera / sobrecupo posible
              </div>
            )}
          </div>

          <div
            className={`request-card__expanded-panel ${
              isSelected ? "request-card__expanded-panel--open" : ""
            }`}
          >
            <div className="request-card__expanded-inner">
              {request.message && (
                <div className="request-card__section">
                  <h3 className="request-card__section-title">Mensaje</h3>
                  <div className="request-card__text">
                    <p>{request.message}</p>
                  </div>
                </div>
              )}

              {request.experience && (
                <div className="request-card__section request-card__section--soft">
                  <h3 className="request-card__section-title">
                    Experiencia previa
                  </h3>
                  <div className="request-card__text">
                    <p>{request.experience}</p>
                  </div>
                </div>
              )}

              {request.adminNotes && (
                <div className="request-card__section request-card__section--notes">
                  <h3 className="request-card__section-title">Notas admin</h3>
                  <div className="request-card__text">
                    <p>{request.adminNotes}</p>
                  </div>
                </div>
              )}

              <div className="request-card__links">
                <a
                  href={`mailto:${request.email}`}
                  className="request-card__link-button"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaEnvelope />
                  <span>Enviar mail</span>
                </a>

                {request.whatsapp && (
                  <a
                    href={getWhatsappHref(request.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="request-card__link-button request-card__link-button--whatsapp"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaWhatsapp />
                    <span>Abrir WhatsApp</span>
                  </a>
                )}
              </div>

              {request.status === "pending" && (
                <div className="request-card__actions-block">
                  {request.isCustomPrice && !request.price && (
                    <div className="request-card__custom-price">
                      <input
                        type="number"
                        placeholder="Definir precio (€)"
                        value={customPrice || ""}
                        onChange={(e) => onCustomPriceChange(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <button
                        className="request-card__btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetPrice();
                        }}
                        disabled={actionLoadingId === request._id}
                      >
                        {actionLoadingId === request._id
                          ? "Guardando..."
                          : "Guardar precio"}
                      </button>
                    </div>
                  )}

                  {(!request.isCustomPrice || request.price) && (
                    <div className="request-card__actions">
                      <button
                        className="request-card__btn request-card__btn--approve"
                        onClick={(e) => {
                          e.stopPropagation();
                          onApprove();
                        }}
                        disabled={actionLoadingId === request._id}
                      >
                        {actionLoadingId === request._id
                          ? "Procesando..."
                          : "Aprobar"}
                      </button>

                      <button
                        className="request-card__btn request-card__btn--reject"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReject();
                        }}
                        disabled={actionLoadingId === request._id}
                      >
                        {actionLoadingId === request._id
                          ? "Procesando..."
                          : "Rechazar"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}

export default RequestCard;