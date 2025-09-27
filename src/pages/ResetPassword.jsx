import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import "../styles/pages/Login.css";
import { Helmet } from "react-helmet";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations.resetPasswordPage[language];

  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});

  // 📏 Reglas (podés ajustar fácilmente)
  const rules = useMemo(() => {
    const lengthOk = password.length >= 8;
    const lowerOk = /[a-z]/.test(password);
    const upperOk = /[A-Z]/.test(password);
    const numberOk = /\d/.test(password);
    // Si querés exigir símbolo, descomentá la línea siguiente y agregalo abajo al listado:
    // const symbolOk = /[^A-Za-z0-9]/.test(password);

    return {
      lengthOk,
      lowerOk,
      upperOk,
      numberOk,
      // symbolOk,
      allOk: lengthOk && lowerOk && upperOk && numberOk,
    };
  }, [password]);

  const validate = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = t.errors.passwordRequired;
    } else if (!rules.allOk) {
      // Mensaje general (seguís viendo el checklist, esto es por si hacen submit igual)
      newErrors.password = t.errors.passwordInvalid;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t.errors.confirmPasswordRequired;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t.errors.passwordsNotMatch;
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccess(t.success);
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const message = err?.response?.data?.error || t.generalError;
      setErrors({ general: message });
    }
  };

  // Textos del checklist (fallback en ES por si aún no agregaste traducciones)
  const L = {
    title: t?.requirementsTitle || "La nueva contraseña debe incluir:",
    len: t?.requirements?.len || "Mínimo 8 caracteres",
    lower: t?.requirements?.lower || "Al menos 1 letra minúscula (a–z)",
    upper: t?.requirements?.upper || "Al menos 1 letra mayúscula (A–Z)",
    num: t?.requirements?.num || "Al menos 1 número (0–9)",
    // sym: t?.requirements?.sym || "Al menos 1 símbolo (., !, @, #, etc.)",
    show: t?.show || "Mostrar",
    hide: t?.hide || "Ocultar",
  };

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="login-container">
        <h1 className="login-title">{t.title}</h1>

        {success && <p className="login-success">{success}</p>}
        {errors.general && <p className="login-error">{errors.general}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Nueva contraseña */}
          <div className="input-group">
            <div className="password-field">
              <input
                type={showPass ? "text" : "password"}
                placeholder={t.newPasswordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="password-requirements"
                aria-invalid={!!errors.password}
                required
              />
              <button
                type="button"
                className="toggle-pass-btn"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? L.hide : L.show}
              >
                {showPass ? L.hide : L.show}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}

            {/* Checklist dinámico */}
            <div id="password-requirements" className="password-reqs" aria-live="polite">
              <p className="reqs-title">{L.title}</p>
              <ul className="reqs-list">
                <li className={`req-item ${rules.lengthOk ? "ok" : "bad"}`}>
                  <span className="req-icon">{rules.lengthOk ? "✓" : "✗"}</span>{L.len}
                </li>
                <li className={`req-item ${rules.lowerOk ? "ok" : "bad"}`}>
                  <span className="req-icon">{rules.lowerOk ? "✓" : "✗"}</span>{L.lower}
                </li>
                <li className={`req-item ${rules.upperOk ? "ok" : "bad"}`}>
                  <span className="req-icon">{rules.upperOk ? "✓" : "✗"}</span>{L.upper}
                </li>
                <li className={`req-item ${rules.numberOk ? "ok" : "bad"}`}>
                  <span className="req-icon">{rules.numberOk ? "✓" : "✗"}</span>{L.num}
                </li>
                {/* <li className={`req-item ${rules.symbolOk ? "ok" : "bad"}`}>
                  <span className="req-icon">{rules.symbolOk ? "✓" : "✗"}</span>{L.sym}
                </li> */}
              </ul>
            </div>
          </div>

          {/* Confirmación */}
          <div className="input-group">
            <input
              type="password"
              placeholder={t.confirmPasswordPlaceholder}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!errors.confirmPassword}
              required
            />
            {errors.confirmPassword && (
              <p className="field-error">{errors.confirmPassword}</p>
            )}
          </div>

          <button type="submit" disabled={!password || !confirmPassword}>
            {t.resetButton}
          </button>
        </form>
      </div>
    </>
  );
}

export default ResetPassword;
