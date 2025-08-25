// src/components/ScrollToTop/ScrollToTop.jsx
import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const scrollTargets = new Set();

    // 1) Ventana / documento
    scrollTargets.add(window);
    scrollTargets.add(document.scrollingElement || document.documentElement);
    scrollTargets.add(document.body);

    // 2) Contenedor de tu app (ajusta si usas otro)
    const appContainer = document.querySelector(".app-container");
    if (appContainer) scrollTargets.add(appContainer);

    // Función que intenta varios métodos de scroll
    const scrollTopAll = () => {
      scrollTargets.forEach((t) => {
        try {
          if (t === window) {
            window.scrollTo({ top: 0, behavior: "instant" });
          } else if (t && typeof t.scrollTo === "function") {
            t.scrollTo({ top: 0, behavior: "instant" });
          } else if (t && "scrollTop" in t) {
            t.scrollTop = 0;
          }
        } catch {}
      });
    };

    // Ejecutamos varias veces por si el contenido tarda en montarse
    let attempts = 0;
    const tryScroll = () => {
      scrollTopAll();
      attempts++;
      if (attempts < 5) setTimeout(tryScroll, 50);
    };

    tryScroll();
  }, [pathname]);

  return null;
}
