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
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
