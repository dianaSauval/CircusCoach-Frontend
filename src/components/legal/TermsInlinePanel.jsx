// src/components/legal/TermsInlinePanel.jsx
import React from "react";
import TermsViewer from "./TermsViewer";
import "../../styles/pages/LegalTerms.css"; // ya lo tenés
import "./TermsInlinePanel.css"; // estilos de este panel

export default function TermsInlinePanel({ language = "es" }) {
  return (
    <div
      id="terms-box"
      className="legal-inline-panel"
      role="region"
      aria-label="Términos y Condiciones"
      tabIndex={-1}
    >
      {/* Podés cambiar variant="pdf" por "raw" si preferís sin transformaciones */}
      <TermsViewer language={language} variant="pdf" compact />
    </div>
  );
}
