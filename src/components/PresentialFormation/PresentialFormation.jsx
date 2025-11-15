import React, { useEffect, useState } from "react";
import "./PresentialFormation.css";
import { FaMapMarkerAlt, FaRegCalendarAlt } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../i18n/translations";
import { getPresentialFormationsByLang } from "../../services/presentialService";
import EmptyState from "../EmptyState/EmptyState";

const PresentialFormationCard = ({ formation }) => {
  const { title, location, dateType, singleDate, dateRange, registrationLink } =
    formation;

  const formatFecha = (date, incluirAño = true) => {
    const fecha = new Date(date);
    const opciones = { day: "numeric", month: "long" };
    const diaYMes = fecha.toLocaleDateString("es-ES", opciones);
    const año = fecha.getFullYear();
    return incluirAño ? `${diaYMes} del ${año}` : diaYMes;
  };

  const dateDisplay =
    dateType === "single" ? (
      <span>{formatFecha(singleDate)}</span>
    ) : (
      <span>
        {formatFecha(dateRange.start, false)} -{" "}
        {formatFecha(dateRange.end, false)}
      </span>
    );

  const handleClick = () => {
    if (registrationLink) {
      window.open(registrationLink, "_blank");
    }
  };

  return (
    <div className="formation-pill">
      <div
        className={`circle-icon ${registrationLink ? "clickable" : ""}`}
        onClick={handleClick}
      ></div>

      <div className="formation-text">
        <div className="line-top">
          <div>
            <FaRegCalendarAlt className="icon" />
            <span>{dateDisplay}</span>
          </div>
          <div>
            <FaMapMarkerAlt className="icon location-icon" />
            <span>{location}</span>
          </div>
        </div>

        <div className="line-bottom">
          {registrationLink ? (
            <a
              className="presentialFormation-title"
              href={registrationLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {title}
            </a>
          ) : (
            <span className="presentialFormation-title">{title}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const PresentialFormationsList = () => {
  const [formations, setFormations] = useState([]);
  const { language } = useLanguage();
  const t = translations.formations[language];

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const data = await getPresentialFormationsByLang(language);
        setFormations(data);
      } catch (err) {
        console.error("Error al traer formaciones presenciales:", err);
      }
    };

    fetchFormations();
  }, [language]);

  // ✅ Solo mostramos las formaciones que estén completas en este idioma
  const isFormationComplete = (formation) => {
    if (!formation) return false;

    const { title, location, dateType, singleDate, dateRange } = formation;

    if (!title || !location || !dateType) return false;

    if (dateType === "single") {
      return Boolean(singleDate);
    }

    if (dateType === "range") {
      return Boolean(
        dateRange &&
          dateRange.start &&
          dateRange.end
      );
    }

    // Por si algún día aparece otro tipo de dateType raro
    return false;
  };

  const visibleFormations = formations.filter(isFormationComplete);

  return (
    <div className="formations-wrapper">
      <h2 className="formations-title">{t.upcomingTitle}</h2>

      {visibleFormations.length === 0 ? (
        <EmptyState title={t.noPresentialTitle} subtitle={t.noPresentialText} />
      ) : (
        visibleFormations.map((formation) => (
          <PresentialFormationCard key={formation._id} formation={formation} />
        ))
      )}
    </div>
  );
};


export default PresentialFormationsList;
