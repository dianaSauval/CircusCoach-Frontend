import React from "react";
import "../styles/pages/BioRocioGarrote.css";
import { FaFilePdf } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

const BioRocioGarrote = () => {
  const { language } = useLanguage(); // ✅ traemos del context
  const t = translations.about[language];

  return (
    <section className="biografia-section">
      <div className="biografia-content">
        <div className="biografia-texto">
          <p className="texto">{t.paragraph1}</p>
          <p className="texto">{t.paragraph2} </p>
          <p className="texto">{t.paragraph3}</p>

         

          <div className="firma-rocio">Rocío Garrote
          <a
            href="https://res.cloudinary.com/dkdhdy9e5/raw/upload/v1743214000/CircusCoach/CV-RocioGarrote.pdf"
            className="biografia-pdf"
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <FaFilePdf className="pdf-icon" />
            <span> {t.downloadCV}</span>
          </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BioRocioGarrote;
