import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken, loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import "../styles/pages/Login.css";

function Login() {
  const { login } = useAuth();
  const { language } = useLanguage();
  const t = translations.loginPage[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await loginUser(email, password);
      saveToken(response.token);
      await login();
      navigate("/");
    } catch (err) {
      console.error("Error en el login:", err);
      setError(t.error);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">{t.title}</h1>
      {error && <p className="login-error">{error}</p>}

      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder={t.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="boton-secundario" type="submit">{t.loginButton}</button>

        <div className="login-links">
          <button type="button" className="link-button" onClick={() => navigate("/olvidaste-tu-contraseña")}>
            {t.forgotPassword}
          </button>
          <button type="button" className="link-button" onClick={() => navigate("/register")}>
            {t.noAccount}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;

