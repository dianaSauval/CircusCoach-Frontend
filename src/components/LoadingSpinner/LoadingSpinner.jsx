// src/components/LoadingSpinner/LoadingSpinner.jsx
import React from "react";
import "./LoadingSpinner.css";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../i18n/translations";

export default function LoadingSpinner({ texto }) {
  const { language } = useLanguage();
  const t = translations.loadingSpinner[language]?.default || "Cargando...";

  return (
    <div className="loading-spinner-container">
      <div className="spinner" />
      <p className="loading-texto">{texto || t}</p>
    </div>
  );
}
