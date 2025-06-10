// src/components/common/TermsCheckbox.js
import React from "react";

const TermsCheckbox = ({ checked, onChange, termsUrl }) => {
  return (
    <div className="terms-checkbox">
      <input
        type="checkbox"
        id="acceptTerms"
        checked={checked}
        onChange={onChange}
        required
      />
      <label htmlFor="acceptTerms">
        He leído y acepto los{" "}
        <a
          href={termsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#7e1dc3", textDecoration: "underline" }}
        >
          Términos y Condiciones de compra
        </a>
        .
      </label>
    </div>
  );
};

export default TermsCheckbox;
