// components/legal/TermsModal.jsx
/* components/legal/TermsModal.jsx */
import React from "react";
import TermsViewer from "./TermsViewer";
import "./TermsModal.css";
import "../../styles/pages/LegalTerms.css"; // <-- reutilizamos estilos

export default function TermsModal({ open, onClose, language = "es" }) {
  if (!open) return null;
  return (
    <div className="mcc-modal-backdrop">
      <div className="mcc-modal-card">
        <button type="button" className="mcc-modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="legal-md" style={{ maxWidth: 880, margin: "0 auto" }}>
          <TermsViewer language={language} variant="pdf" compact />
        </div>
      </div>
    </div>
  );
}
