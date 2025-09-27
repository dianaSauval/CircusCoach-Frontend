// src/components/common/TermsCheckbox/TermsCheckbox.jsx
import "./TermsCheckbox.css";
import React from "react";
import TermsInlinePanel from "../../legal/TermsInlinePanel"; // ✅ importamos el panel inline

const LABELS = {
  es: {
    title: "Términos y Condiciones de Compra",
    accept: "He leído y acepto los Términos y Condiciones",
    privacy: "He leído la Política de Privacidad",
    viewFull: "Ver texto completo",
  },
  fr: {
    title: "Conditions Générales d’Achat",
    accept: "J’ai lu et j’accepte les Conditions Générales",
    privacy: "J’ai lu la Politique de Confidentialité",
    viewFull: "Voir le texte complet",
  },
};

export default function TermsCheckbox({
  checkedTerms,
  onChangeTerms,
  checkedPrivacy,
  onChangePrivacy,
  language = "es",
  termsUrl = "/terminos",
  privacyUrl = "/privacidad",
}) {
  const t = LABELS[language] || LABELS.es;

  return (
    <div className="terms-container">
      <div className="terms-box">
        <h3>{t.title}</h3>

        {/* ✅ En vez del botón, mostramos directamente los términos inline */}
        <div style={{ marginTop: ".5rem", marginBottom: "1rem" }}>
          <TermsInlinePanel language={language} />
        </div>

      {/*   {/* Links extra (opcional, podés quitarlos si ya no los querés) 
        <p style={{ marginTop: ".5rem" }}>
          <a href={termsUrl} target="_blank" rel="noopener noreferrer">
            {t.title}
          </a>
          {" · "}
          <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
            {t.privacy}
          </a>
        </p> */}
      </div>

      <div className="terms-checkbox">
        <label htmlFor="acceptTerms">{t.accept}</label>
        <input
          type="checkbox"
          id="acceptTerms"
          checked={checkedTerms}
          onChange={onChangeTerms}
          required
        />
      </div>

      <div className="terms-checkbox">
        <label htmlFor="acceptPrivacy">{t.privacy}</label>
        <input
          type="checkbox"
          id="acceptPrivacy"
          checked={checkedPrivacy}
          onChange={onChangePrivacy}
          required
        />
      </div>
    </div>
  );
}
