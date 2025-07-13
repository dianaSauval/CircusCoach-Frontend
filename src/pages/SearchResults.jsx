import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getCourses } from "../services/courseService";
import { getVisibleFormations } from "../services/formationService";
import { useLanguage } from "../context/LanguageContext";
import Card from "../components/Card/Card";
import translations from "../i18n/translations";
import "../styles/pages/SearchResults.css";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import EmptyState from "../components/EmptyState/EmptyState";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// 🔤 Normaliza tildes y convierte a minúsculas
const normalize = (str) =>
  str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase() || "";

export default function SearchResults() {
  const query = useQuery();
  const searchTerm = query.get("q") || "";
  const { language } = useLanguage();
  const t = translations.searchResults?.[language] || {
    title: "Resultados de búsqueda",
    noResults: "No se encontraron resultados.",
  };

  const [courses, setCourses] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);

      const [allCourses, allFormations] = await Promise.all([
        getCourses(language),
        getVisibleFormations(language),
      ]);

      const normalizedTerm = normalize(searchTerm);

      const filterItems = (items) => {
        return items.filter((item) => {
          const title =
            typeof item.title === "string"
              ? normalize(item.title)
              : normalize(item.title?.[language]);

          const description =
            typeof item.description === "string"
              ? normalize(item.description)
              : normalize(item.description?.[language]);

          return (
            title.includes(normalizedTerm) ||
            description.includes(normalizedTerm)
          );
        });
      };

      const filteredCourses = filterItems(allCourses);
      const filteredFormations = filterItems(allFormations);

      setCourses(filteredCourses);
      setFormations(filteredFormations);
      setLoading(false);
    };

    if (searchTerm) fetchResults();
  }, [searchTerm, language]);

  return (
    <div className="search-results-container">
      <h1 className="titulo-principal">
        {t.title}: <span className="subtitulo search-term">“{searchTerm}”</span>
      </h1>

      {loading ? (
        <LoadingSpinner />
      ) : courses.length === 0 && formations.length === 0 ? (
        <EmptyState
          title={t.noResults || "No se encontraron resultados."}
          subtitle={t.noResultsSubtitle}
        />
      ) : (
        <div className="card-grid">
          {formations.map((formation) => (
            <Card
              key={formation._id}
              data={formation}
              onClick={() =>
                (window.location.href = `/formaciones/${formation._id}/${
                  formation.slug || "detalle"
                }`)
              }
            />
          ))}
          {courses.map((course) => (
            <Card
              key={course._id}
              data={course}
              onClick={() =>
                (window.location.href = `/courses/${course._id}/${
                  course.slug || "detalle"
                }`)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
