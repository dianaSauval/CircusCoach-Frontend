import { Helmet } from "react-helmet";
import "../styles/pages/ComingSoonPage.css";

export default function ComingSoonPage() {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="coming-soon-container">
        <h1 className="titulo-principal coming-title">
          Página en mantenimiento
        </h1>
        <p className="subtitulo coming-subtitle">
          Estamos preparando todo para vos...
        </p>
        <p className="texto coming-text">
          En estos momentos no es posible comprar ningún curso ni formación.
        </p>
        <p className="texto coming-text">
          Próximamente podrás acceder a todos nuestros contenidos y servicios.
        </p>
        <p className="firma coming-signature">Gracias por tu paciencia 💫</p>
      </div>
    </>
  );
}
