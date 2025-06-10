import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      navigate("/login");
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Panel de Administración</h1>

      <div className="admin-sections">
        {/* Formaciones Online */}
        <div className="admin-card">
          <h2 className="admin-card-title">Formaciones Online</h2>
          <p className="admin-card-desc">Gestioná el contenido, módulos y clases de tus formaciones online.</p>
          <Link to="/admin/formaciones-online" className="admin-card-button">Ver Formaciones</Link>
        </div>

        {/* Formaciones Presenciales */}
        <div className="admin-card">
          <h2 className="admin-card-title">Formaciones Presenciales</h2>
          <p className="admin-card-desc">Agregá, editá o eliminá tus formaciones presenciales y workshops.</p>
          <Link to="/admin/formaciones-presenciales" className="admin-card-button">Ver Presenciales</Link>
        </div>

        {/* Cursos */}
        <div className="admin-card">
          <h2 className="admin-card-title">Cursos Sueltos</h2>
          <p className="admin-card-desc">Accedé a la gestión de cursos individuales disponibles para los alumnos.</p>
          <Link to="/admin/cursos" className="admin-card-button">Ver Cursos</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
