import React from "react";
import "./TrainingSchools.css";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../i18n/translations";

const TrainingSchools = () => {
  const { language } = useLanguage(); // ✅ traemos del context
  const t = translations.formations[language].trainingSchools;
  return (
    <section className="escuelas-section">
      <div className="escuelas-content">
        <h1 className="titulo-principal">{t.title}</h1>
        <p className="texto">
        {t.paragraph1}
        </p>
        <p className="texto">
        {t.paragraph2}
        </p>
        <p className="texto">
        {t.paragraph3}
        </p>
        <p className="texto">
        {t.paragraph4}
        </p>
        <div className="destacado">
          <span className="icono">💡</span>
          <p className="texto">
          {t.highlight}
          </p>
        </div>

        <div className="contacto">
          <span className="icono">📩</span>
          <p>
          {t.contact}
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrainingSchools;
