import { useEffect, useState } from "react";
import "./RequestDecisionModal.css";

function RequestDecisionModal({
  isOpen,
  mode = "approve",
  requestData,
  loading = false,
  onClose,
  onConfirm,
}) {
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setAdminNotes("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !requestData) return null;

  const isApprove = mode === "approve";

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("request-decision-modal")) {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(adminNotes);
  };

  return (
    <div
      className="request-decision-modal"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-decision-modal-title"
    >
      <div className="request-decision-modal__content">
        <button
          type="button"
          className="request-decision-modal__close"
          onClick={onClose}
          disabled={loading}
          aria-label="Cerrar"
        >
          ×
        </button>

        <p className="request-decision-modal__eyebrow">
          {isApprove ? "Aprobar solicitud" : "Rechazar solicitud"}
        </p>

        <h2
          id="request-decision-modal-title"
          className="request-decision-modal__title"
        >
          {requestData.firstName} {requestData.lastName}
        </h2>

        <p className="request-decision-modal__subtitle">
          {isApprove
            ? "Podés agregar un mensaje opcional para enviar junto con la aprobación."
            : "Podés escribir un motivo o una nota opcional para acompañar el rechazo."}
        </p>

        <div className="request-decision-modal__summary">
          <p>
            <strong>Servicio:</strong> {requestData.serviceLabel}
          </p>
          {requestData.resetEdition?.title && (
            <p>
              <strong>Edición RESET:</strong> {requestData.resetEdition.title}
            </p>
          )}
          <p>
            <strong>Email:</strong> {requestData.email}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="adminNotes"
            className="request-decision-modal__label"
          >
            Mensaje para la solicitud
          </label>

          <textarea
            id="adminNotes"
            name="adminNotes"
            rows="6"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder={
              isApprove
                ? "Ej: Gracias por tu solicitud. Tu propuesta fue aprobada y ya podés avanzar con el pago."
                : "Ej: En este momento no tengo disponibilidad para acompañarte en este formato."
            }
            disabled={loading}
          />

          <div className="request-decision-modal__actions">
            <button
              type="button"
              className="request-decision-modal__btn request-decision-modal__btn--secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`request-decision-modal__btn ${
                isApprove
                  ? "request-decision-modal__btn--approve"
                  : "request-decision-modal__btn--reject"
              }`}
              disabled={loading}
            >
              {loading
                ? "Procesando..."
                : isApprove
                  ? "Confirmar aprobación"
                  : "Confirmar rechazo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestDecisionModal;