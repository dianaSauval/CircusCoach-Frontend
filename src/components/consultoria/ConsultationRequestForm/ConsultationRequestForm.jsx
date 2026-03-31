import "./ConsultationRequestForm.css";

const statusLabelMap = {
  open: "Abierto",
  full: "Completo",
  closed: "Inscripción cerrada",
};

function ConsultationRequestForm({
  services,
  formData,
  selectedServiceConfig,
  resetEditions,
  selectedResetEdition,
  loadingEditions,
  submitting,
  submitError,
  submitSuccess,
  onChange,
  onSelectService,
  onSubmit,
  formatDate,
  formatDateTime,
}) {
  const customPriceOptions = ["coaching-custom", "direction-creative-process"];

  const isCustomPriceOption = customPriceOptions.includes(
    formData.selectedOption,
  );
  return (
    <section className="consultoria-form-section" id="consultoria-formulario">
      <div className="consultoria-section-heading">
        <h2>Enviar solicitud</h2>
        <p>
          No es una compra automática. Primero enviás tu solicitud, Rocío la
          revisa y, si corresponde, te manda el link de pago.
        </p>
      </div>

      <form className="consultoria-form" onSubmit={onSubmit}>
        <div className="consultoria-form__grid">
          <div className="consultoria-field">
            <label htmlFor="firstName">Nombre *</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={onChange}
              placeholder="Tu nombre"
            />
          </div>

          <div className="consultoria-field">
            <label htmlFor="lastName">Apellido</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={onChange}
              placeholder="Tu apellido"
            />
          </div>

          <div className="consultoria-field">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              placeholder="tuemail@mail.com"
            />
          </div>

          <div className="consultoria-field">
            <label htmlFor="whatsapp">WhatsApp</label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="text"
              value={formData.whatsapp}
              onChange={onChange}
              placeholder="+34 ..."
            />
          </div>

          <div className="consultoria-field">
            <label htmlFor="language">Idioma</label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={onChange}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div className="consultoria-field">
            <label htmlFor="serviceType">Servicio *</label>
            <select
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={(e) => onSelectService(e.target.value)}
            >
              <option value="">Seleccionar servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>

          <div className="consultoria-field consultoria-field--full">
            <label htmlFor="selectedOption">Formato / precio *</label>
            <select
              id="selectedOption"
              name="selectedOption"
              value={formData.selectedOption}
              onChange={onChange}
              disabled={!selectedServiceConfig}
            >
              <option value="">Seleccionar opción</option>
              {selectedServiceConfig?.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {isCustomPriceOption && (
              <p className="consultoria-field__hint">
                Esta opción tiene un precio personalizado. Primero enviás tu
                solicitud, Rocío la revisa y luego te enviará una propuesta con
                el valor correspondiente antes del pago.
              </p>
            )}
          </div>

          {selectedServiceConfig?.requiresResetEdition && (
            <div className="consultoria-field consultoria-field--full">
              <label htmlFor="resetEdition">Edición disponible *</label>

              {loadingEditions ? (
                <div className="consultoria-inline-message">
                  Cargando fechas...
                </div>
              ) : (
                <>
                  <select
                    id="resetEdition"
                    name="resetEdition"
                    value={formData.resetEdition}
                    onChange={onChange}
                  >
                    <option value="">Seleccionar fecha</option>

                    {resetEditions.map((edition) => {
                      const isFull = edition.status === "full";
                      const isClosed = edition.status === "closed";
                      const isDisabled = isFull || isClosed;

                      return (
                        <option
                          key={edition._id}
                          value={edition._id}
                          disabled={isDisabled}
                        >
                          {edition.title} — {formatDate(edition.startDate)} — €
                          {Number(edition.price || 0).toFixed(2)}
                          {isFull ? " — Completo" : ""}
                          {isClosed ? " — Inscripción cerrada" : ""}
                        </option>
                      );
                    })}
                  </select>

                  <p className="consultoria-field__hint">
                    Elegí una edición disponible para ver el detalle completo
                    del programa y las fechas de cada encuentro.
                  </p>

                  {selectedResetEdition && (
                    <div className="consultoria-reset-card">
                      <div className="consultoria-reset-card__header">
                        <div className="consultoria-reset-card__intro">
                          <p className="consultoria-reset-card__eyebrow">
                            Programa grupal RESET
                          </p>
                          <h3 className="consultoria-reset-card__title">
                            {selectedResetEdition.title}
                          </h3>
                          <p className="consultoria-reset-card__subtitle">
                            Un recorrido guiado para revisar tu entrenamiento,
                            ordenar el proceso y volver a conectar con claridad
                            y dirección.
                          </p>
                        </div>

                        <span className="consultoria-reset-card__badge">
                          {statusLabelMap[selectedResetEdition.status] ||
                            selectedResetEdition.status}
                        </span>
                      </div>

                      <div className="consultoria-reset-card__summary">
                        <div className="consultoria-reset-card__item">
                          <span>Inicio</span>
                          <strong>
                            {formatDate(selectedResetEdition.startDate)}
                          </strong>
                        </div>

                        <div className="consultoria-reset-card__item">
                          <span>Duración</span>
                          <strong>
                            {selectedResetEdition.durationWeeks || 0} semanas
                          </strong>
                        </div>

                        <div className="consultoria-reset-card__item">
                          <span>Encuentros</span>
                          <strong>
                            {selectedResetEdition.totalSessions || 0}
                          </strong>
                        </div>

                        <div className="consultoria-reset-card__item">
                          <span>Cupo máximo</span>
                          <strong>
                            {selectedResetEdition.capacity || 0} personas
                          </strong>
                        </div>

                        <div className="consultoria-reset-card__item consultoria-reset-card__item--highlight">
                          <span>Valor</span>
                          <strong>
                            €
                            {Number(selectedResetEdition.price || 0).toFixed(2)}
                          </strong>
                        </div>
                      </div>

                      {selectedResetEdition.sessions?.length > 0 && (
                        <div className="consultoria-reset-card__sessions">
                          <h4>Agenda de encuentros</h4>
                          <ul>
                            {selectedResetEdition.sessions.map(
                              (session, index) => (
                                <li key={session._id || index}>
                                  <div className="consultoria-reset-card__session-dot" />
                                  <div className="consultoria-reset-card__session-content">
                                    <span className="consultoria-reset-card__session-index">
                                      Encuentro {index + 1}
                                    </span>
                                    <span className="consultoria-reset-card__session-date">
                                      {formatDateTime(session.date)}
                                    </span>
                                  </div>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="consultoria-field consultoria-field--full">
            <label htmlFor="experience">Experiencia previa</label>
            <p className="consultoria-field__description">
              Contanos cuál es tu recorrido hasta ahora: disciplina, años de
              práctica, si entrenás actualmente, y cualquier información que
              ayude a entender mejor tu proceso.
            </p>
            <textarea
              id="experience"
              name="experience"
              rows="5"
              value={formData.experience || ""}
              onChange={onChange}
              placeholder=""
            />
          </div>

          <div className="consultoria-field consultoria-field--full">
            <label htmlFor="message">Mensaje</label>
            <p className="consultoria-field__description">
              Contá brevemente qué necesitás, qué te gustaría trabajar, en qué
              momento estás hoy y por qué sentís que este espacio puede
              ayudarte.
            </p>
            <textarea
              id="message"
              name="message"
              rows="6"
              value={formData.message}
              onChange={onChange}
              placeholder=""
            />
          </div>
        </div>

        {submitError && (
          <div className="consultoria-alert consultoria-alert--error">
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="consultoria-alert consultoria-alert--success">
            {submitSuccess}
          </div>
        )}

        <div className="consultoria-form__footer">
          <button
            type="submit"
            className="consultoria-btn consultoria-btn--primary consultoria-btn--large"
            disabled={submitting}
          >
            {submitting
              ? "Enviando..."
              : selectedServiceConfig?.submitText || "Enviar solicitud"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ConsultationRequestForm;
