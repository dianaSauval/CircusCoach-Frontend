import React from "react";
import "../styles/pages/BioRocioGarrote.css";
import { FaFilePdf } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import { Helmet } from "react-helmet";

const BioRocioGarrote = () => {
  const { language } = useLanguage(); // ✅ traemos del context
  const t = translations.about[language];

  return (
    <>
      <Helmet>
        <link rel="canonical" href="https://mycircuscoach.com/biografia" />
        <title>CircusCoach - Biografía de Rocío Garrote</title>
        <meta
          name="description"
          content="Conocé a Rocío Garrote, artista y docente de circo con formación en Argentina y Europa. Especialista en palo chino y pedagogía circense, combina técnica, arte y neurociencia para potenciar el entrenamiento y la enseñanza del circo contemporáneo."
        />
      </Helmet>
      <section className="biografia-section">
        <div className="biografia-content">
          <div className="biografia-texto">
            <p className="texto">{t.paragraph1}</p>
            <p className="texto">{t.paragraph2} </p>
            <p className="texto">{t.paragraph3}</p>

            <div className="firma-rocio">
              Rocío Garrote
              <a
                href="/pdfs/CV-RocioGarrote-2026-ES.pdf"
                className="biografia-pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="CV-RocioGarrote-2026-ES.pdf"
              >
                <FaFilePdf className="pdf-icon" />
                <span>{t.downloadCV}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BioRocioGarrote;
