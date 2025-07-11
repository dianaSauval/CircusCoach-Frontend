import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FormacionesGrid.css";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../i18n/translations";
import { getVisibleFormations } from "../../services/formationService";
import Card from "../Card/Card";
import EmptyState from "../EmptyState/EmptyState";

const FormacionesGrid = () => {
  const [formaciones, setFormaciones] = useState([]);
  const { language } = useLanguage();
  const t = translations.formations[language];
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFormaciones = async () => {
      try {
        const data = await getVisibleFormations(language);
        setFormaciones(data);
      } catch (error) {
        console.error("Error al obtener formaciones:", error);
      }
    };

    fetchFormaciones();
  }, [language]);

  const handleCardClick = (id, title) => {
    const urlTitle = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    navigate(`/formaciones/${id}/${urlTitle}`);
  };

  return (
    <div className="formaciones-section">
      <h2 className="formaciones-title">{t.fullTrainings}</h2>
      <div className="formaciones-subtitle">
        <p className="subtitulo">{t.deepenProfession}</p>
        <p className="subtitulo">{t.improveSkills}</p>
      </div>

      {formaciones.length === 0 ? (
        <EmptyState
          title={t.comingSoonTitle}
          subtitle={t.comingSoonText}
        />
      ) : (
        <div className="formaciones-grid">
          {formaciones.map((formacion) => (
            <Card
              key={formacion._id}
              data={formacion}
              onClick={() => handleCardClick(formacion._id, formacion.title)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FormacionesGrid;

