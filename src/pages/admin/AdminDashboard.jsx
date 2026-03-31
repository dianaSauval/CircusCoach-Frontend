import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin/AdminDashboard.css";
import { Helmet } from "react-helmet";

function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      navigate("/login");
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="admin-dashboard">
        <h1 className="titulo-principal">Panel de Administración</h1>

        <div className="admin-sections">
          {/* Coaching - Solicitudes */}
          <div className="admin-card admin-card--highlight">
            <h2 className="titulo-principal">Solicitudes de Coaching</h2>
            <p className="texto">
              Revisá las solicitudes enviadas por clientes y aprobá o rechazá según tu agenda.
            </p>
            <Link to="/admin/solicitudes-coaching" className="boton-secundario">
              Ver Solicitudes
            </Link>
          </div>

          {/* Coaching - RESET */}
          <div className="admin-card admin-card--highlight">
            <h2 className="titulo-principal">Ediciones RESET</h2>
            <p className="texto">
              Creá nuevas fechas grupales de RESET y administrá cupos, precio y visibilidad.
            </p>
            <Link to="/admin/reset-ediciones" className="boton-secundario">
              Gestionar RESET
            </Link>
          </div>

          {/* Formaciones Online */}
          <div className="admin-card">
            <h2 className="titulo-principal">Formaciones Online</h2>
            <p className="texto">
              Gestioná el contenido, módulos y clases de tus formaciones online.
            </p>
            <Link to="/admin/formaciones-online" className="boton-secundario">
              Ver Formaciones
            </Link>
          </div>

          {/* Formaciones Presenciales */}
          <div className="admin-card">
            <h2 className="titulo-principal">Formaciones Presenciales</h2>
            <p className="texto">
              Agregá, editá o eliminá tus formaciones presenciales y workshops.
            </p>
            <Link
              to="/admin/formaciones-presenciales"
              className="boton-secundario"
            >
              Ver Presenciales
            </Link>
          </div>

          {/* Cursos */}
          <div className="admin-card">
            <h2 className="titulo-principal">Cursos Sueltos</h2>
            <p className="texto">
              Accedé a la gestión de cursos individuales disponibles para los
              alumnos.
            </p>
            <Link to="/admin/cursos" className="boton-secundario">
              Ver Cursos
            </Link>
          </div>

          {/* Bonos / Descuentos */}
          <div className="admin-card">
            <h2 className="titulo-principal">Bonos de Descuento</h2>
            <p className="texto">
              Creá, modificá o desactivá descuentos por campaña para tus cursos
              y formaciones.
            </p>
            <Link to="/admin/bonos" className="boton-secundario">
              Gestionar Bonos
            </Link>
          </div>

          {/* Productos Físicos */}
          <div className="admin-card">
            <h2 className="titulo-principal">Productos Físicos</h2>
            <p className="texto">
              Gestioná los productos físicos que recomendás y vendés a través de
              Amazon: imagen, descripción, precio y stock.
            </p>
            <Link to="/admin/productos-fisicos" className="boton-secundario">
              Ver Productos
            </Link>
          </div>

          {/* Libros / E-books */}
          <div className="admin-card">
            <h2 className="titulo-principal">Libros / E-books</h2>
            <p className="texto">
              Subí y gestioná tus libros en PDF: título, portada, precio,
              visibilidad y archivo.
            </p>
            <Link to="/admin/libros" className="boton-secundario">
              Ver Libros
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;