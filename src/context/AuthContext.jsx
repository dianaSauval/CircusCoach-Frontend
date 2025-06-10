import { createContext, useContext, useEffect, useState } from "react";
import { getToken, removeToken } from "../services/authService";
import { getUserProfile } from "../services/userService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null = no cargado aún
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
  
      try {
        const userData = await getUserProfile();
        setUser(userData);
      } catch (error) {
        console.error("Error al cargar el perfil del usuario:", error);
        removeToken();
      } finally {
        setLoading(false);
      }
    };
  
    cargarUsuario();
  }, []);
  

 const login = async () => {
  try {
    const profile = await getUserProfile(); // asegurás traer los datos más actualizados
    setUser(profile);
  } catch (error) {
    console.error("Error al obtener perfil tras login", error);
    removeToken();
  }
};


  const logout = () => {
    removeToken();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin"; // por si después querés usar roles

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
