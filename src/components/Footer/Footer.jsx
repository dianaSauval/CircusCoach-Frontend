import "./Footer.css";
import logo from "../../assets/img/Logo.png";
import { FaEnvelope, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../i18n/translations";

function Footer() {
  const { language } = useLanguage(); // ✅ traemos del context
  const t = translations.footer[language];
  return (
    <footer className="footer">
      <div className="footer-left">
        <div className="logo-wrapper">
          <img src={logo} alt="Circus Coach" className="footer-logo" />
          <div className="floating-icons">
            <a
              href="https://www.instagram.com/circuscoachbyrociogarrote"
              target="_blank"
              rel="noopener noreferrer"
              className="circle-icon-footer"
            >
              <FaInstagram />
            </a>

            <a
              href="mailto:circuscoachbyrociogarrote@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="circle-icon-footer"
            >
              <FaEnvelope />
            </a>
            <a
              href="https://wa.me/32455113039"
              target="_blank"
              rel="noopener noreferrer"
              className="circle-icon-footer"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-right">
        <h3> {t.contactTitle}</h3>
        <div className="footer-contact">
  <FaEnvelope className="footer-icon" />
  <a
    href="mailto:circuscoachbyrociogarrote@gmail.com"
    target="_blank"
    rel="noopener noreferrer"
    className="footer-link"
  >
    circuscoachbyrociogarrote@gmail.com
  </a>
</div>

<div className="footer-contact">
  <FaWhatsapp className="footer-icon" />
  <a
    href="https://wa.me/32455113039"
    target="_blank"
    rel="noopener noreferrer"
    className="footer-link"
  >
    +32(0)455.11.30.39
  </a>
</div>

      </div>
    </footer>
  );
}

export default Footer;
