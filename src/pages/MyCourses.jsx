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
import { useCart } from "../context/CartContext"; // ✅ agregado

function MyCourses() {
  const [formations, setFormations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [expiredFormations, setExpiredFormations] = useState([]);
  const [expiredCourses, setExpiredCourses] = useState([]);

  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { cart, setCart } = useCart(); // ✅ agregado

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
          const ahora = new Date();

          const cursosActivos = [];
          const cursosExpirados = [];
          for (const c of cursos) {
            const data = {
              ...c.courseId,
              _id: c.courseId._id,
              fechaExpiracion: c.fechaExpiracion,
              type: "course",
            };
            if (new Date(c.fechaExpiracion) > ahora) {
              cursosActivos.push(data);
            } else {
              cursosExpirados.push(data);
            }
          }

          const formacionesActivas = [];
          const formacionesExpiradas = [];
          for (const f of formaciones) {
            const data = {
              ...f.formationId,
              _id: f.formationId._id,
              fechaExpiracion: f.fechaExpiracion,
              type: "formation",
            };
            if (new Date(f.fechaExpiracion) > ahora) {
              formacionesActivas.push(data);
            } else {
              formacionesExpiradas.push(data);
            }
          }

          setFormations(formacionesActivas);
          setCourses(cursosActivos);
          setExpiredFormations(formacionesExpiradas);
          setExpiredCourses(cursosExpirados);
        }
      } catch (error) {
        console.error("Error al cargar cursos/formaciones:", error);
      }
    };

    if (isAuthenticated) fetchData();
  }, [language, isAuthenticated, isAdmin, loading]);

  const onRebuy = (item) => {
    const yaEsta = cart.find((c) => c._id === item._id && c.type === item.type);
    if (!yaEsta) {
      setCart([...cart, item]);
    }
    navigate("/pago-embed");
  };

  return (
    <div className="my-courses-page">
      {/* FORMACIONES ACTIVAS */}
      <h2 className="titulo-principal">{t.titleFormations}</h2>
      <div className="formaciones-grid">
        {formations.length > 0 ? (
          formations.map((formacion) => (
            <Card
              key={formacion._id}
              data={formacion}
              fechaExpiracion={formacion.fechaExpiracion}
              expirado={false}
              visible={formacion.visible?.[language]}
              onClick={() =>
                navigate(`/mis-cursos/formacion/${formacion._id}`, {
                  state: {
                    visible: formacion.visible?.[language],
                    fechaExpiracion: formacion.fechaExpiracion,
                  },
                })
              }
            />
          ))
        ) : (
          <EmptyState
            title={isAdmin ? t.emptyFormationsTitleAdmin : t.emptyFormationsTitleUser}
            subtitle={isAdmin ? t.emptyFormationsSubtitleAdmin : t.emptyFormationsSubtitleUser}
          />
        )}
      </div>

      {/* FORMACIONES EXPIRADAS */}
      {expiredFormations.length > 0 && (
        <>
          <h3 className="subtitulo-expirado">{t.titleExpiredFormations}</h3>
          <div className="formaciones-grid">
            {expiredFormations.map((formacion) => (
              <Card
                key={formacion._id}
                data={formacion}
                fechaExpiracion={formacion.fechaExpiracion}
                expirado={true}
                visible={formacion.visible?.[language]}
                onRebuy={!isAdmin ? onRebuy : undefined}
                onClick={() => navigate(`/detalle/formacion/${formacion._id}`)}
              />
            ))}
          </div>
        </>
      )}

      {/* CURSOS ACTIVOS */}
      <h2 className="titulo-principal">{t.titleCourses}</h2>
      <div className="formaciones-grid">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Card
              key={course._id}
              data={course}
              fechaExpiracion={course.fechaExpiracion}
              expirado={false}
              visible={course.visible?.[language]}
              onClick={() =>
                navigate(`/mis-cursos/curso/${course._id}`, {
                  state: {
                    visible: course.visible?.[language],
                    fechaExpiracion: course.fechaExpiracion,
                  },
                })
              }
            />
          ))
        ) : (
          <EmptyState
            title={isAdmin ? t.emptyCoursesTitleAdmin : t.emptyCoursesTitleUser}
            subtitle={isAdmin ? t.emptyCoursesSubtitleAdmin : t.emptyCoursesSubtitleUser}
          />
        )}
      </div>

      {/* CURSOS EXPIRADOS */}
      {expiredCourses.length > 0 && (
        <>
          <h3 className="subtitulo-expirado">{t.titleExpiredCourses}</h3>
          <div className="formaciones-grid">
            {expiredCourses.map((course) => (
              <Card
                key={course._id}
                data={course}
                fechaExpiracion={course.fechaExpiracion}
                expirado={true}
                visible={course.visible?.[language]}
                onRebuy={!isAdmin ? onRebuy : undefined}
                onClick={() => navigate(`/detalle/curso/${course._id}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MyCourses;
