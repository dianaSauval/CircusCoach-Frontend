import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { cartCount } = useCart();
  const { language, setLanguage } = useLanguage();
  const t = translations.header[language];
  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Scroll helper
const scrollTopAll = (smooth = true) => {
  const behavior = smooth ? "smooth" : "auto";
  const targets = [
    window,
    document.scrollingElement || document.documentElement,
    document.body,
    document.querySelector(".app-container"),
  ].filter(Boolean);

  targets.forEach((t) => {
    try {
      if (t === window) {
        window.scrollTo({ top: 0, behavior });
      } else if (typeof t.scrollTo === "function") {
        t.scrollTo({ top: 0, behavior });
      } else if ("scrollTop" in t) {
        t.scrollTop = 0;
      }
    } catch {}
  });
};


  // Navegación inteligente: si ya estás en la ruta, sólo scrollea arriba
  const handleSmartNav = (e, path) => {
  if (location.pathname === path) {
    e.preventDefault();
    setMenuOpen(false);
    // Esperamos a que cierre el menú y se re‑pinte el layout
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollTopAll(true);
      });
    });
  } else {
    setMenuOpen(false);
    navigate(path);
  }
};


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchTerm)}`);
      setSearchOpen(false);
      setSearchTerm("");
      scrollTopAll(false);
    }
  };

  const handleSearchToggle = () => {
    setSearchOpen((prev) => !prev);
    setSearchTerm("");
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
        {/* Home */}
        <NavLink
          to="/"
          className="nav-link"
          onClick={(e) => handleSmartNav(e, "/")}
        >
          <p>{t.home}</p>
        </NavLink>

        {/* Cursos */}
        <NavLink
          to="/cursos"
          className="nav-link"
          onClick={(e) => handleSmartNav(e, "/cursos")}
        >
          {t.courses}
        </NavLink>

        {/* Formaciones */}
        <NavLink
          to="/formaciones"
          className="nav-link"
          onClick={(e) => handleSmartNav(e, "/formaciones")}
        >
          {t.formations}
        </NavLink>

        {/* Biografía */}
        <NavLink
          to="/biografia"
          className="nav-link"
          onClick={(e) => handleSmartNav(e, "/biografia")}
        >
          {t.aboutUs}
        </NavLink>

        {isAuthenticated && (
          <>
            {/* Mis cursos */}
            <NavLink
              to="/mis-cursos"
              className="nav-link"
              onClick={(e) => handleSmartNav(e, "/mis-cursos")}
            >
              {t.myCourses}
            </NavLink>

            {/* Admin */}
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className="nav-link"
                onClick={(e) => handleSmartNav(e, "/admin")}
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
                  <FaTimes className="close-search" onClick={handleSearchToggle} />
                </form>
              ) : (
                <FaSearch className="header-icon" onClick={handleSearchToggle} />
              )}
            </div>

            {/* Carrito / mantenimiento: navegación normal */}
            <NavLink to="/mantenimiento" className="cart-icon-container" onClick={() => setMenuOpen(false)}>
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
                <FaTimes className="close-search" onClick={handleSearchToggle} />
              </form>
            ) : (
              <FaSearch className="header-icon" onClick={handleSearchToggle} />
            )}
          </div>

          <NavLink to="/pago-embed" className="cart-icon-container">
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
