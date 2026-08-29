import React, { useEffect, useState } from "react";
import "./PresentialFormation.css";
import { FaMapMarkerAlt, FaRegCalendarAlt } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../i18n/translations";
import { getPresentialFormationsByLang } from "../../services/presentialService";
import EmptyState from "../EmptyState/EmptyState";

const PresentialFormationCard = ({ formation }) => {
  const { language } = useLanguage();

  const { title, location, dateType, singleDate, dateRange, registrationLink } =
    formation;

  const localeMap = {
    es: "es-ES",
    en: "en-GB",
    fr: "fr-FR",
  };

  const locale = localeMap[language] || "es-ES";

  const parseDate = (date) => {
    if (!date) return null;

    const cleanDate = date.split("T")[0];
    const [year, month, day] = cleanDate.split("-").map(Number);

    return new Date(year, month - 1, day);
  };

  const formatSingleDate = (date) => {
    const fecha = parseDate(date);

    if (!fecha) return "";

    return fecha.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateRange = (start, end) => {
    const inicio = parseDate(start);
    const fin = parseDate(end);

    if (!inicio || !fin) return "";

    const mismoAño = inicio.getFullYear() === fin.getFullYear();

    const mismoMes = mismoAño && inicio.getMonth() === fin.getMonth();

    /*
      MISMO MES Y MISMO AÑO
      Ejemplo:
      29 - 30 de agosto de 2026
    */
    if (mismoMes) {
      if (language === "es") {
        const mes = fin.toLocaleDateString(locale, {
          month: "long",
        });

        return `${inicio.getDate()} - ${fin.getDate()} de ${mes} de ${fin.getFullYear()}`;
      }

      if (language === "fr") {
        const mes = fin.toLocaleDateString(locale, {
          month: "long",
        });

        return `${inicio.getDate()} - ${fin.getDate()} ${mes} ${fin.getFullYear()}`;
      }

      const monthYear = fin.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      });

      return `${inicio.getDate()} - ${fin.getDate()} ${monthYear}`;
    }

    /*
      DISTINTO MES, MISMO AÑO
      Ejemplo:
      29 de agosto - 2 de septiembre de 2026
    */
    if (mismoAño) {
      const inicioFormateado = inicio.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
      });

      const finFormateado = fin.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      return `${inicioFormateado} - ${finFormateado}`;
    }

    /*
      DISTINTO AÑO
      Ejemplo:
      29 de diciembre de 2026 - 2 de enero de 2027
    */
    const inicioFormateado = inicio.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const finFormateado = fin.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return `${inicioFormateado} - ${finFormateado}`;
  };

  const dateDisplay =
    dateType === "single"
      ? formatSingleDate(singleDate)
      : formatDateRange(dateRange?.start, dateRange?.end);

  const handleClick = () => {
    if (registrationLink) {
      window.open(registrationLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="formation-pill">
      <div
        className={`circle-icon ${registrationLink ? "clickable" : ""}`}
        onClick={handleClick}
        aria-hidden="true"
      />

      <div className="formation-text">
        <div className="line-top">
          <div className="formation-info-row">
            <FaRegCalendarAlt className="icon" />

            <span>{dateDisplay}</span>
          </div>

          <div className="formation-info-row">
            <FaMapMarkerAlt className="icon" />

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

  const isFormationComplete = (formation) => {
    if (!formation) return false;

    const { title, location, dateType, singleDate, dateRange } = formation;

    if (!title || !location || !dateType) {
      return false;
    }

    if (dateType === "single") {
      return Boolean(singleDate);
    }

    if (dateType === "range") {
      return Boolean(dateRange && dateRange.start && dateRange.end);
    }

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
