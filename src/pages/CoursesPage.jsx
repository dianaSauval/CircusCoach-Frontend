import { useEffect, useState } from "react";
import "../styles/pages/CoursesPage.css";
import { getCourses } from "../services/courseService";
import Card from "../components/Card/Card";
import EmptyState from "../components/EmptyState/EmptyState";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  const { language } = useLanguage(); // idioma global
  const t = translations.coursesPage[language]; // textos traducidos

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses(language);
        setCourses(data);
      } catch (error) {
        console.error("Error al cargar cursos visibles:", error);
      }
    };

    fetchCourses();
  }, [language]);

  return (
    <div className="courses-container">
      <h1 className="courses-title">{t.title}</h1>
      <p className="courses-subtitle">
        {t.subtitle.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            <br />
          </span>
        ))}
      </p>

      {courses.length === 0 ? (
        <EmptyState title={t.emptyTitle} subtitle={t.emptySubtitle} />
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <Card
              key={course._id}
              image={course.image}
              description={course.description}
              onClick={() => {
                const slug = course.title?.[language]
                  ?.toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^\w-]/g, "");
                navigate(`/courses/${course._id}/${slug}`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
