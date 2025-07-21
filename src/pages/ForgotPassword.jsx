import { useState } from "react";
import { requestPasswordReset } from "../services/authService";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import "../styles/pages/Login.css";
import { Helmet } from "react-helmet";

function ForgotPassword() {
  const { language } = useLanguage();
  const t = translations.forgotPasswordPage[language];

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      await requestPasswordReset(email);
      setMessage(t.successMessage);
    } catch (err) {
      setError(err.response?.data?.error || t.errorMessage);
    }
  };

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="login-container">
        <h1 className="login-title">{t.title}</h1>

        {message && <p className="login-success">{message}</p>}
        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="boton-secundario" type="submit">
            {t.submitButton}
          </button>
        </form>
      </div>
    </>
  );
}

export default ForgotPassword;
