import TestimonialCarousel from '../components/TestimonialCarousel/TestimonialCarousel';
import '../styles/pages/Home.css';
import { useNavigate } from 'react-router-dom';
import testimonios from "../data/testimonios.json";
import CategoryButtons from '../components/CategoryButtons/CategoryButtons';
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";

export default function Home() {
  const navigate = useNavigate();
  const { language } = useLanguage(); // ✅ traemos del context
  const t = translations.home[language];

  return (
    <>
    <section className="home-hero">
      <div className="home-content">
        <h1>
        {t.heroTitle}
        </h1>

        <button onClick={() => navigate('/formaciones')}>{t.heroButton}</button>

        <div className="home-description">
          <p>
          {t.paragraph1}
          </p>
          <p> {t.paragraph2}</p>
          <p>
          {t.paragraph3}
          </p>
          <p>{t.paragraph4}</p>
        </div>
      </div>
    </section>
    <CategoryButtons/>
    <TestimonialCarousel testimonios={testimonios} />

    </>
  );
}
