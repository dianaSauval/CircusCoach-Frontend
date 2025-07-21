import { useState } from "react";
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = t.errors.passwordRequired;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
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
          <div className="input-group">
            <input
              type="password"
              placeholder={t.newPasswordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && (
              <p className="field-error">{errors.password}</p>
            )}
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder={t.confirmPasswordPlaceholder}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errors.confirmPassword && (
              <p className="field-error">{errors.confirmPassword}</p>
            )}
          </div>

          <button type="submit">{t.resetButton}</button>
        </form>
      </div>
    </>
  );
}

export default ResetPassword;
