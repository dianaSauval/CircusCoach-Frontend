import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    let attempts = 0;

    const tryScroll = () => {
      // Intentamos hacer scroll varias veces por si el contenido tarda en montarse
      window.scrollTo({ top: 0, behavior: "smooth" });
      attempts++;

      if (attempts < 5) {
        setTimeout(tryScroll, 50); // probamos de nuevo en 50ms, hasta 5 veces
      }
    };

    requestAnimationFrame(tryScroll);

    return () => {
      // Limpieza si se desmonta antes de terminar
      attempts = 5;
    };
  }, [pathname]);

  return null;
}
