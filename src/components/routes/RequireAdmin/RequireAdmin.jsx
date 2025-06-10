import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

function RequireAdmin() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return null;

  return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/login" />;
}

export default RequireAdmin;
