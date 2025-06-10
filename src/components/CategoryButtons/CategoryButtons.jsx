import React from 'react';
import './CategoryButtons.css';
import { NavLink } from 'react-router-dom';
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../i18n/translations";

const CategoryButtons = () => {
  const { language } = useLanguage(); // ✅ traemos del context
  const t = translations.home[language];
  return (
    <div className="category-buttons">
<NavLink to="/cursos" className="category-button">{t.categoryShortCourses}</NavLink>
<NavLink to="/formaciones" className="category-button">{t.categoryFullPrograms}</NavLink>
<NavLink to="/formaciones" className="category-button">{t.categoryProSchools}</NavLink>

    </div>
  );
};

export default CategoryButtons;

