import { Link, useSearchParams } from "react-router-dom";
import "../styles/pages/ServicePaymentCanceledPage.css";

const getCanceledContent = (serviceType) => {
  if (serviceType === "reset") {
    return {
      title: "Tu pago no fue completado",
      subtitle: "Tu plaza todavía no quedó confirmada",
      text: "No te preocupes: tu solicitud sigue registrada, pero el pago no se completó. Si todavía quieres reservar tu lugar, puedes retomar el proceso desde el enlace que recibiste por correo.",
    };
  }

  if (serviceType === "coaching") {
    return {
      title: "Tu pago no fue completado",
      subtitle: "Tu sesión todavía no quedó confirmada",
      text: "Tu solicitud sigue registrada, pero el pago no se completó. Si quieres continuar, puedes volver a usar el enlace de pago enviado por correo.",
    };
  }

  if (serviceType === "artistic-direction") {
    return {
      title: "Tu pago no fue completado",
      subtitle: "Tu servicio todavía no quedó confirmado",
      text: "Tu solicitud sigue registrada, pero el pago no se completó. Si quieres continuar, puedes volver a usar el enlace de pago enviado por correo.",
    };
  }

  return {
    title: "Tu pago no fue completado",
    subtitle: "La operación fue cancelada",
    text: "No se realizó el cobro. Si deseas continuar más adelante, podrás hacerlo desde el enlace de pago recibido por correo.",
  };
};

export default function ServicePaymentCanceledPage() {
  const [searchParams] = useSearchParams();
  const serviceType = searchParams.get("serviceType");

  const content = getCanceledContent(serviceType);

  return (
    <main className="service-payment-canceled-page">
      <section className="service-payment-canceled-card">
        <div className="service-payment-canceled-icon-wrapper">
          <div className="service-payment-canceled-icon">!</div>
        </div>

        <p className="service-payment-canceled-kicker">Pago cancelado</p>

        <h1 className="titulo-principal service-payment-canceled-title">
          {content.title}
        </h1>

        <p className="subtitulo service-payment-canceled-subtitle">
          {content.subtitle}
        </p>

        <p className="texto service-payment-canceled-text">{content.text}</p>

        <p className="texto service-payment-canceled-text service-payment-canceled-note">
          Si cerraste la ventana por error o tuviste un problema con la tarjeta, puedes intentarlo nuevamente desde el mismo enlace.
        </p>

        <div className="service-payment-canceled-actions">
          <Link
            to="/consultoria-personal"
            className="boton-principal service-payment-canceled-button-link"
          >
            Volver a coaching
          </Link>

          <Link
            to="/"
            className="boton-secundario service-payment-canceled-button-link"
          >
            Ir al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}