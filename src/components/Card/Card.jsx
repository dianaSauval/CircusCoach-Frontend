import "./Card.css";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../i18n/translations";

const Card = ({ image, description, onClick, visible = true }) => {
  const { language } = useLanguage();
const t = translations.myCourses[language];

  // 📷 Imagen multilenguaje
  const selectedImage =
    typeof image === "string" ? image : image?.[language] || image?.es || null;

  // 📝 Descripción multilenguaje
  const selectedDescription =
    typeof description === "string"
      ? description
      : description?.[language] || description?.es || "";

  function truncateText(text, maxLength = 120) {
    if (text.length <= maxLength) return text;
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    return truncated.slice(0, lastSpace) + "...";
  }

  return (
    <div
      className={`custom-card ${!visible ? "card-disabled" : ""}`}
      onClick={visible ? onClick : undefined}
      style={{ cursor: visible && onClick ? "pointer" : "default" }}
    >
      {selectedImage && (
        <img
          src={selectedImage}
          alt="Imagen del curso o formación"
          className="custom-card-img"
        />
      )}

      <div className="custom-card-description">
        {truncateText(selectedDescription)}
      </div>

      {!visible && (
        <div className="card-overlay">
          <span>{t.notAvailableInLanguage}</span>
        </div>
      )}
    </div>
  );
};

export default Card;
