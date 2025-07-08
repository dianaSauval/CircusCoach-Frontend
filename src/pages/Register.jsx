import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import "../styles/pages/Login.css";

function Register() {
  const { language } = useLanguage();
  const t = translations.registerPage[language];

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t.errors.name;
    if (!formData.surname.trim()) newErrors.surname = t.errors.surname;

    if (!formData.email) {
      newErrors.email = t.errors.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.errors.emailInvalid;
    }

    if (!formData.password) {
      newErrors.password = t.errors.passwordRequired;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)) {
      newErrors.password = t.errors.passwordInvalid;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t.errors.confirmPasswordRequired;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.errors.passwordsNotMatch;
    }

    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await registerUser({
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        password: formData.password,
      });
      setSuccess(t.successMessage);
      setFormData({ name: "", surname: "", email: "", password: "", confirmPassword: "" });
      setTimeout(() => navigate("/registro-exitoso"), 2000);
    } catch (err) {
      console.error("Error al registrar:", err?.response?.data || err.message);
      setErrors({ general: err?.response?.data?.error || t.generalError });
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">{t.title}</h1>

      {errors.general && <p className="login-error">{errors.general}</p>}
      {success && <p className="login-success">{success}</p>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
          <input
            type="text"
            name="name"
            placeholder={t.namePlaceholder}
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="input-group">
          <input
            type="text"
            name="surname"
            placeholder={t.surnamePlaceholder}
            value={formData.surname}
            onChange={handleChange}
            required
          />
          {errors.surname && <p className="field-error">{errors.surname}</p>}
        </div>

        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder={t.emailPlaceholder}
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="input-group">
          <input
            type="password"
            name="password"
            placeholder={t.passwordPlaceholder}
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div className="input-group">
          <input
            type="password"
            name="confirmPassword"
            placeholder={t.confirmPasswordPlaceholder}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
        </div>

        <button className="boton-secundario" type="submit">{t.registerButton}</button>
      </form>
    </div>
  );
}

export default Register;
