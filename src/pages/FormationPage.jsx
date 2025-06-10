import { useRef } from 'react';
import '../styles/pages/FormationPage.css';
import FormacionesGrid from '../components/FormacionesGrid/FormacionesGrid';
import PresentialFormationsList from '../components/PresentialFormation/PresentialFormation';
import TrainingSchools from '../components/TrainingSchools/TrainingSchools';
import VideoTrainingSchool from '../components/VideoTrainingSchool/VideoTrainingSchool';
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";


export default function FormationPage() {
  const presencialRef = useRef(null);
  const onlineRef = useRef(null);
  const escuelasRef = useRef(null);
  const { language } = useLanguage(); // ✅ traemos del context
  const t = translations.formations[language];

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };




  return (
    <>
    <div className="formation-hero">
      <div className="formation-buttons">
        <button onClick={() => scrollToSection(onlineRef)}> {t.online}</button>
        <button onClick={() => scrollToSection(presencialRef)}>{t.presential}</button>
        <button onClick={() => scrollToSection(escuelasRef)}>{t.schools}</button>
      </div>
    </div>
      {/* 🔹 ONLINE */}
      <section ref={onlineRef} className="section">
        
        <FormacionesGrid/>
      </section>
        {/* 🔹 PRESENCIALES */}
            <section ref={presencialRef} className="section">
              <PresentialFormationsList/>
        
        </section>

      {/* 🔹 ESCUELAS */}
      <section ref={escuelasRef} className="section school">
        <TrainingSchools/>
      </section>
      <section className="section">
      <VideoTrainingSchool/>
      </section>  
    </>
  );
}
