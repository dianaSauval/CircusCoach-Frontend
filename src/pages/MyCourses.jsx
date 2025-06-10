import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCourses } from "../services/courseService";
import { getVisibleFormations } from "../services/formationService";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import "../styles/pages/MyCourses.css";
import Card from "../components/Card/Card";
import EmptyState from "../components/EmptyState/EmptyState";
import { getMisCompras } from "../services/userService";

function MyCourses() {
  const [formations, setFormations] = useState([]);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // ✅ Traducciones basadas en tu estructura actual
  const t = translations.myCourses[language];

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        if (isAdmin) {
          const [formationsData, coursesData] = await Promise.all([
            getVisibleFormations(language),
            getCourses(language),
          ]);
          setFormations(formationsData);
          setCourses(coursesData);
        } else {
          const { cursos, formaciones } = await getMisCompras();
          setFormations(formaciones);
          setCourses(cursos);
        }
      } catch (error) {
        console.error("Error al cargar cursos/formaciones:", error);
      }
    };

    if (isAuthenticated) fetchData();
  }, [language, isAuthenticated, isAdmin, loading]);

  return (
    <div className="my-courses-page">
      <h2 className="section-title">{t.titleFormations}</h2>
      <div className="formaciones-grid">
        {formations.length > 0 ? (
          formations.map((formacion) => (
            <Card
              key={formacion._id}
              image={formacion.image}
              description={formacion.title}
              visible={formacion.visible?.[language]}
              onClick={() =>
                navigate(`/mis-cursos/formacion/${formacion._id}`, {
                  state: {
                    visible: formacion.visible?.[language], // ✅ lo que importa
                  },
                })
              }
            />
          ))
        ) : (
          <EmptyState
            title={
              isAdmin ? t.emptyFormationsTitleAdmin : t.emptyFormationsTitleUser
            }
            subtitle={
              isAdmin
                ? t.emptyFormationsSubtitleAdmin
                : t.emptyFormationsSubtitleUser
            }
          />
        )}
      </div>

      <h2 className="section-title">{t.titleCourses}</h2>
      <div className="formaciones-grid">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Card
              key={course._id}
              image={course.image}
              description={course.title}
              visible={course.visible?.[language]}
              onClick={() =>
                navigate(`/mis-cursos/curso/${course._id}`, {
                  state: {
                    visible: course.visible?.[language], // ✅ también lo pasamos
                  },
                })
              }
            />
          ))
        ) : (
          <EmptyState
            title={isAdmin ? t.emptyCoursesTitleAdmin : t.emptyCoursesTitleUser}
            subtitle={
              isAdmin ? t.emptyCoursesSubtitleAdmin : t.emptyCoursesSubtitleUser
            }
          />
        )}
      </div>
    </div>
  );
}

export default MyCourses;
