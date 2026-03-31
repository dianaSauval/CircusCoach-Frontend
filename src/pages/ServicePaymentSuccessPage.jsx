import { Link, useSearchParams } from "react-router-dom";
import "../styles/pages/ServicePaymentSuccessPage.css";

const getSuccessContent = (serviceType, selectedOption) => {
  if (serviceType === "reset") {
    return {
      title: "¡Tu pago fue realizado con éxito!",
      subtitle: "Gracias por reservar tu lugar en CircusCoach",
      text: "Tu plaza quedó confirmada. En breve recibirás un correo con la información importante de la edición y, si corresponde, el acceso al grupo de WhatsApp.",
      primaryButtonText: "Volver a coaching",
      primaryButtonLink: "/consultoria-personal",
    };
  }

  if (serviceType === "coaching") {
    if (selectedOption === "coaching-pack-4") {
      return {
        title: "¡Tu pago fue realizado con éxito!",
        subtitle: "Gracias por reservar tu espacio en CircusCoach",
        text: "Tu pago fue confirmado correctamente. En breve recibirás un correo con los próximos pasos para coordinar tu pack de sesiones.",
        primaryButtonText: "Volver a coaching",
        primaryButtonLink: "/consultoria-personal",
      };
    }

    if (selectedOption === "coaching-custom") {
      return {
        title: "¡Tu pago fue realizado con éxito!",
        subtitle: "Gracias por reservar tu espacio en CircusCoach",
        text: "Tu pago fue confirmado correctamente. En breve recibirás un correo con los próximos pasos para coordinar tu propuesta personalizada.",
        primaryButtonText: "Volver a coaching",
        primaryButtonLink: "/consultoria-personal",
      };
    }

    return {
      title: "¡Tu pago fue realizado con éxito!",
      subtitle: "Gracias por reservar tu espacio en CircusCoach",
      text: "Tu pago fue confirmado correctamente. En breve recibirás un correo con los próximos pasos para coordinar el servicio.",
      primaryButtonText: "Volver a coaching",
      primaryButtonLink: "/consultoria-personal",
    };
  }

  if (serviceType === "artistic-direction") {
    return {
      title: "¡Tu pago fue realizado con éxito!",
      subtitle: "Gracias por confiar en CircusCoach",
      text: "Tu pago fue confirmado correctamente. En breve recibirás un correo con la siguiente instancia del proceso.",
      primaryButtonText: "Volver a coaching",
      primaryButtonLink: "/consultoria-personal",
    };
  }

  return {
    title: "¡Tu pago fue realizado con éxito!",
    subtitle: "Gracias por confiar en CircusCoach",
    text: "Tu pago fue confirmado correctamente. En breve recibirás un correo con los detalles correspondientes.",
    primaryButtonText: "Volver al inicio",
    primaryButtonLink: "/",
  };
};

export default function ServicePaymentSuccessPage() {
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");
  const serviceType = searchParams.get("serviceType");
  const selectedOption = searchParams.get("selectedOption");

  const content = getSuccessContent(serviceType, selectedOption);

  return (
    <main className="service-payment-success-page">
      <section className="service-payment-success-card">
        <div className="service-payment-success-icon-wrapper">
          <div className="service-payment-success-icon">✓</div>
        </div>

        <p className="service-payment-success-kicker">Pago confirmado</p>

        <h1 className="titulo-principal service-payment-success-title">
          {content.title}
        </h1>

        <p className="subtitulo service-payment-success-subtitle">
          {content.subtitle}
        </p>

        <p className="texto service-payment-success-text">{content.text}</p>

        <p className="texto service-payment-success-text service-payment-success-note">
          Si no ves el correo en tu bandeja principal, revisa también spam o promociones.
        </p>

     

        <div className="service-payment-success-actions">
          <Link
            to={content.primaryButtonLink}
            className="boton-principal service-payment-success-button-link"
          >
            {content.primaryButtonText}
          </Link>

          <Link
            to="/"
            className="boton-secundario service-payment-success-button-link"
          >
            Ir al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}