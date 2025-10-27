import { useRef } from "react";
import "../styles/pages/FormationPage.css";
import FormacionesGrid from "../components/FormacionesGrid/FormacionesGrid";
import PresentialFormationsList from "../components/PresentialFormation/PresentialFormation";
import TrainingSchools from "../components/TrainingSchools/TrainingSchools";
import VideoTrainingSchool from "../components/VideoTrainingSchool/VideoTrainingSchool";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import { Helmet } from "react-helmet";

export default function FormationPage() {
  const presencialRef = useRef(null);
  const onlineRef = useRef(null);
  const escuelasRef = useRef(null);
  const { language } = useLanguage(); // ✅ traemos del context
  const t = translations.formations[language];

const scrollToSection = (ref) => {
  const el = ref.current;
  if (!el) return;

  // Usa la compensación que pondremos en CSS (scroll-margin-top)
  try {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch {
    // Fallback muy viejo
    el.scrollIntoView();
  }
};


  return (
    <>
      <Helmet>
        <title>CircusCoach - Formaciones de Circo Online y Presenciales</title>
        <link rel="canonical" href="https://mycircuscoach.com/formaciones" />
        <meta
          name="description"
          content="Explorá nuestras formaciones de circo online y presenciales, diseñadas por Rocío Garrote con un enfoque técnico, pedagógico y artístico. Acceso a cursos intensivos, escuelas asociadas y entrenamientos especializados."
        />
      </Helmet>
      <div className="formation-hero">
        <div className="formation-buttons">
          <button
            className="boton-principal"
            onClick={() => scrollToSection(onlineRef)}
          >
            {" "}
            {t.online}
          </button>
          <button
            className="boton-principal"
            onClick={() => scrollToSection(presencialRef)}
          >
            {t.presential}
          </button>
          <button
            className="boton-principal"
            onClick={() => scrollToSection(escuelasRef)}
          >
            {t.schools}
          </button>
        </div>
      </div>
      {/* 🔹 ONLINE */}
      <section ref={onlineRef} className="section">
        <FormacionesGrid />
      </section>
      {/* 🔹 PRESENCIALES */}
      <section ref={presencialRef} className="section">
        <PresentialFormationsList />
      </section>

      {/* 🔹 ESCUELAS */}
      <section ref={escuelasRef} className="section school">
        <TrainingSchools />
      </section>
      <section className="section">
        <VideoTrainingSchool />
      </section>
    </>
  );
}
