import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

export default RequireAuth;
