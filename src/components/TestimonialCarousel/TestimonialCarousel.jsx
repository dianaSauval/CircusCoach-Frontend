// 📦 COMPONENTE COMPLETO
import { useEffect, useState } from "react";
import "./TestimonialCarousel.css";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../i18n/translations";

export default function TestimonialCarousel({ testimonios }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [itemsPorSlide, setItemsPorSlide] = useState(3);
  const [slides, setSlides] = useState([]);
  const { language, setLanguage } = useLanguage(); // ✅ traemos del context
  const t = translations.home[language];


  // 🔁 Agrupar testimonios cada vez que cambia el tamaño
  useEffect(() => {
    const agruparEnSlides = (array, tamaño) => {
      const result = [];
      for (let i = 0; i < array.length; i += tamaño) {
        result.push(array.slice(i, i + tamaño));
      }
      return result;
    };

    const actualizarSlides = () => {
      let nuevosItems = 3; // por defecto para desktop
    
      if (window.innerWidth <= 768) {
        nuevosItems = 1; // mobile
      } else if (window.innerWidth <= 1024) {
        nuevosItems = 2; // tablets
      }
    
      setItemsPorSlide(nuevosItems);
      setSlideIndex(0);
      const nuevosSlides = agruparEnSlides(testimonios, nuevosItems);
      setSlides(nuevosSlides);
    };
   

    actualizarSlides();
    window.addEventListener("resize", actualizarSlides);
    return () => window.removeEventListener("resize", actualizarSlides);
  }, [testimonios]);

  const totalSlides = slides.length;

  const siguiente = () => {
    if (slideIndex < totalSlides - 1) {
      setSlideIndex(slideIndex + 1);
    }
  };

  const anterior = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    }
  };

  return (
    <section className="testimonial-carousel">
      <h2 className="testimonial-titulo"> {t.testimonialTitle}</h2>

      <div className="testimonial-contenedor">
        <button className="flecha" onClick={anterior} disabled={slideIndex === 0}>
          ◀
        </button>

        <div className="testimonial-cards-wrapper">
        <div
  className="testimonial-cards"
  style={{
    transform: `translateX(-${slideIndex * (100 / slides.length)}%)`,
    width: `${slides.length * 100}%`,
  }}
>

            {slides.map((grupo, i) => (
              <div
              className="testimonial-slide"
              key={i}
              style={{ width: `${100 / slides.length}%` }}
            >
            
                {grupo.map((item, index) => (
                  <div key={index} className="testimonial-bloque">
                    <div className="bubble">
                        <p>{item.texto}</p>             
                    </div>
                    <div className="autor-oval">
                      <p>{item.nombre}</p>
                      <span>{t.testimonial[item.profesion]}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <button className="flecha" onClick={siguiente} disabled={slideIndex >= totalSlides - 1}>
          ▶
        </button>
      </div>

      <div className="dots">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <span
            key={i}
            className={`dot ${slideIndex === i ? "active" : ""}`}
            onClick={() => setSlideIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}