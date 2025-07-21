import { NavLink, useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/img/Logo.png";
import {
  FaSearch,
  FaShoppingBag,
  FaBars,
  FaTimes,
  FaGlobe,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../i18n/translations";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const { cartCount } = useCart();

  const { language, setLanguage } = useLanguage();
  const t = translations.header[language];

  const { user, isAuthenticated, logout } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchTerm)}`);
      setSearchOpen(false);
      setSearchTerm("");
    }
  };

  const handleSearchToggle = () => {
    setSearchOpen((prev) => !prev);
    setSearchTerm(""); // limpiamos si se cierra
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setLanguageMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-logo">
        <img src={logo} alt="Circus Coach Logo" />
      </div>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <nav className={`header-nav ${menuOpen ? "open" : ""}`}>
        <NavLink to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
          <p>{t.home}</p>
        </NavLink>
        <NavLink
          to="/cursos"
          className="nav-link"
          onClick={() => setMenuOpen(false)}
        >
          {t.courses}
        </NavLink>
        <NavLink
          to="/formaciones"
          className="nav-link"
          onClick={() => setMenuOpen(false)}
        >
          {t.formations}
        </NavLink>
        <NavLink
          to="/nosotros"
          className="nav-link"
          onClick={() => setMenuOpen(false)}
        >
          {t.aboutUs}
        </NavLink>

        {isAuthenticated && (
          <>
            <NavLink
              to="/mis-cursos"
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {t.myCourses}
            </NavLink>
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                {t.admin}
              </NavLink>
            )}
          </>
        )}
        {menuOpen && (
          <div className="header-icons">
            <div className="language-selector">
              <button
                className="language-button"
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              >
                <FaGlobe className="globe-icon" />
                <span>{t.language}</span>
                {languageMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              {languageMenuOpen && (
                <ul className="language-dropdown">
                  <li className="texto" onClick={() => changeLanguage("es")}>
                    🇪🇸 Español
                  </li>
                  <li onClick={() => changeLanguage("en")}>🇬🇧 English</li>
                  <li onClick={() => changeLanguage("fr")}>🇫🇷 Français</li>
                </ul>
              )}
            </div>

            <div className="search-container">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="search-form">
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder || "Buscar..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  <FaTimes
                    className="close-search"
                    onClick={handleSearchToggle}
                  />
                </form>
              ) : (
                <FaSearch
                  className="header-icon"
                  onClick={handleSearchToggle}
                />
              )}
            </div>

            <NavLink to="/mantenimiento" className="cart-icon-container">
              <FaShoppingBag className="header-icon" />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </NavLink>
          </div>
        )}
        {isAuthenticated ? (
          <NavLink to="/" className="nav-link mobile-only" onClick={logout}>
            {t.logout}
          </NavLink>
        ) : (
          <NavLink to="/login" className="nav-link mobile-only">
            {t.login}
          </NavLink>
        )}
      </nav>
      {!menuOpen && (
        <div className="header-icons outside-menu">
          <div className="language-selector">
            <button
              className="language-button"
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
            >
              <FaGlobe className="globe-icon" />
              <span>{t.language}</span>
              {languageMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {languageMenuOpen && (
              <ul className="language-dropdown">
                <li onClick={() => changeLanguage("es")}>🇪🇸 Español</li>
                <li onClick={() => changeLanguage("en")}>🇬🇧 English</li>
                <li onClick={() => changeLanguage("fr")}>🇫🇷 Français</li>
              </ul>
            )}
          </div>

          <div className="search-container">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="search-form">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder || "Buscar..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <FaTimes
                  className="close-search"
                  onClick={handleSearchToggle}
                />
              </form>
            ) : (
              <FaSearch className="header-icon" onClick={handleSearchToggle} />
            )}
          </div>

          <NavLink to="/mantenimiento" className="cart-icon-container">
            <FaShoppingBag className="header-icon" />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </NavLink>

          {isAuthenticated ? (
            <NavLink to="/" className="nav-link desktop-only" onClick={logout}>
              {t.logout}
            </NavLink>
          ) : (
            <NavLink to="/login" className="nav-link desktop-only">
              {t.login}
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}
