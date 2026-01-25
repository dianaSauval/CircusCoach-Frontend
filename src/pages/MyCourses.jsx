// pages/MyCourses.jsx
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
import { useCart } from "../context/CartContext";
import { Helmet } from "react-helmet";
import { getAllBooksAdmin } from "../services/bookService";

function MyCourses() {
  const [formations, setFormations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [books, setBooks] = useState([]);

  const [expiredFormations, setExpiredFormations] = useState([]);
  const [expiredCourses, setExpiredCourses] = useState([]);
  const [expiredBooks, setExpiredBooks] = useState([]);

  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { cart, setCart } = useCart();

  const t = translations.myCourses?.[language] || translations.myCourses?.es;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        if (isAdmin) {
          const [formationsData, coursesData, booksData] = await Promise.all([
            getVisibleFormations(language),
            getCourses(language),
            getAllBooksAdmin(), // ✅ todos los libros (admin)
          ]);

          setFormations(Array.isArray(formationsData) ? formationsData : []);
          setCourses(Array.isArray(coursesData) ? coursesData : []);

          // ✅ como admin NO hay expiración
          const normalizeBooks = (
            Array.isArray(booksData) ? booksData : []
          ).map((b) => ({
            ...b,
            type: "book",
            // Card espera image como string o objeto
            image: b.coverImage?.url || "",
            // Card acepta title string perfecto
            title: b.title || "",
            // description string ok
            description: b.description || "",
            price: Number(b.price) || 0,
          }));
          setBooks(normalizeBooks);

          // opcional: vaciar expirados
          setExpiredBooks([]);
          setExpiredCourses([]);
          setExpiredFormations([]);

          return;
        }
        // 👤 USUARIO NORMAL
        const { cursos, formaciones, libros } = await getMisCompras();
        const ahora = new Date();

        /* =====================
   📘 CURSOS
===================== */
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

        /* =====================
   🎪 FORMACIONES
===================== */
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

        /* =====================
   📚 LIBROS
===================== */
        // los libros NO expiran (por ahora)
        const librosActivos = (libros || []).map((l) => ({
          ...l.bookId,
          _id: l.bookId._id,
          type: "book",
          image: l.bookId.coverImage?.url || "",
          title: l.bookId.title || "",
          description: l.bookId.description || "",
          price: Number(l.bookId.price) || 0,
        }));

        setCourses(cursosActivos);
        setExpiredCourses(cursosExpirados);
        setFormations(formacionesActivas);
        setExpiredFormations(formacionesExpiradas);
        setBooks(librosActivos);
        setExpiredBooks([]); // por ahora vacío
      } catch (error) {
        console.error("Error al cargar compras:", error);
      }
    };

    if (isAuthenticated) fetchData();
  }, [language, isAuthenticated, isAdmin, loading, navigate]);

  const onRebuy = (item) => {
    // Normalizo el item al formato de carrito (id, title, image, price, type)
    const id = item._id;
    const yaEsta = cart.find(
      (c) => (c.id || c._id) === id && c.type === item.type,
    );
    if (!yaEsta) {
      setCart([
        ...cart,
        {
          type: item.type,
          id,
          title: item.title, // book: string | course/formation: obj multilang
          image: typeof item.image === "string" ? item.image : (item.coverImage?.url || ""), // book usa coverImage
          price: Number(item.price) || 0,
        },
      ]);
    }
    navigate("/pago-embed");
  };

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

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
              title={
                isAdmin
                  ? t.emptyFormationsTitleAdmin
                  : t.emptyFormationsTitleUser
              }
              subtitle={
                isAdmin
                  ? t.emptyFormationsSubtitleAdmin
                  : t.emptyFormationsSubtitleUser
              }
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
                  onClick={() =>
                    navigate(`/detalle/formacion/${formacion._id}`)
                  }
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
              title={
                isAdmin ? t.emptyCoursesTitleAdmin : t.emptyCoursesTitleUser
              }
              subtitle={
                isAdmin
                  ? t.emptyCoursesSubtitleAdmin
                  : t.emptyCoursesSubtitleUser
              }
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

        {/* =========================
            📚 LIBROS ACTIVOS
           ========================= */}
        <h2 className="titulo-principal">{t.titleBooks || "Mis libros"}</h2>
        <div className="formaciones-grid">
          {books.length > 0 ? (
            books.map((book) => (
              <Card
                key={book._id}
                data={book}
                fechaExpiracion={book.fechaExpiracion}
                expirado={false}
                // para libros no hay visible por idioma; dejamos true
                visible={true}
                onClick={() =>
                  navigate(`/mis-cursos/libro/${book._id}`, {
                    state: { fechaExpiracion: book.fechaExpiracion },
                  })
                }
              />
            ))
          ) : (
            <EmptyState
              title={t.emptyBooksTitleUser || "Aún no tenés libros"}
              subtitle={
                t.emptyBooksSubtitleUser ||
                "Cuando compres un libro, lo vas a encontrar aquí para verlo online o descargarlo."
              }
            />
          )}
        </div>

        {/* LIBROS EXPIRADOS */}
        {expiredBooks.length > 0 && (
          <>
            <h3 className="subtitulo-expirado">
              {t.titleExpiredBooks || "Libros expirados"}
            </h3>
            <div className="formaciones-grid">
              {expiredBooks.map((book) => (
                <Card
                  key={book._id}
                  data={book}
                  fechaExpiracion={book.fechaExpiracion}
                  expirado={true}
                  visible={true}
                  onRebuy={!isAdmin ? onRebuy : undefined}
                  onClick={() => navigate(`/tienda/libros/${book.slug}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default MyCourses;
