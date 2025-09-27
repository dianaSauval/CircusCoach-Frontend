import { useLanguage } from "../context/LanguageContext";
import TermsViewer from "../components/legal/TermsViewer";
import { Helmet } from "react-helmet";
import "../styles/pages/LegalTerms.css";

export default function LegalTermsPage() {
  const { language } = useLanguage();
  const title =
    language === "fr"
      ? "Conditions Générales de Vente"
      : "Condiciones Generales de Venta";

  return (
    <>
      <Helmet>
        <title>{title} | CircusCoach</title>
        <meta name="robots" content="noindex,follow" />
      </Helmet>

      <section className="legal-page">
        <div className="legal-wrap">
          <article className="legal-card">
            <h1 className="legal-title">{title}</h1>
            <p className="legal-subtitle">
              mycircuscoach.com — Documento oficial
            </p>

            {/* Cuerpo del documento (texto literal del .md) */}
            <div className="legal-md">
              <TermsViewer language={language} variant="pdf" compact />
            </div>

            <p className="legal-footnote">
              © CircusCoach — Este documento puede actualizarse. Revisa la fecha
              de la última actualización en el sitio.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
