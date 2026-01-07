import { useEffect, useMemo, useState } from "react";
import "./DiscountBanner.css";
import { useLanguage } from "../../../context/LanguageContext";
import { pickLangWithSpanishFallback } from "../../../utils/pickLang";



const DiscountBanner = ({ name, endDate }) => {
  const { language: lang } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({});

  const title = useMemo(
    () => pickLangWithSpanishFallback(name, lang),
    [name, lang]
  );

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const end = new Date(endDate);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
      const days = Math.floor(diff / 1000 / 60 / 60 / 24);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (!timeLeft) return null;

  // Si no hay título (raro), no mostramos banner
  if (!title) return null;

  return (
    <div className="discount-banner">
      <div className="banner-title">🎉 {title} 🎉</div>
      <div className="banner-subtitle">¡Por tiempo limitado!</div>
      <div className="countdown">
        <span>{timeLeft.days}d</span> :<span>{timeLeft.hours}h</span> :
        <span>{timeLeft.minutes}m</span> :<span>{timeLeft.seconds}s</span>
      </div>
      <div className="banner-cta">
        ¡Aprovechá el descuento antes de que se termine!
      </div>
    </div>
  );
};

export default DiscountBanner;
