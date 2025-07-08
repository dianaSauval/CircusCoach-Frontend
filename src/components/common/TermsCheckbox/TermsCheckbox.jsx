import React from "react";
import "./TermsCheckbox.css"; // Podés poner los estilos ahí

const TermsCheckbox = ({ checked, onChange }) => {
  return (
    <div className="terms-container">
      <div className="terms-box">
        <h3>Términos y Condiciones de Compra</h3>
        <p>
          1. El acceso a los cursos queda habilitado por un período de 1 año
          desde el momento de la compra.
        </p>
        <p>
          2. No se admiten reembolsos una vez confirmada la compra, salvo error
          técnico demostrado.
        </p>
        <p>
          3. Los contenidos están protegidos por derechos de autor. Está
          prohibido compartir, distribuir o descargar el material sin permiso.
        </p>
        <p>
          4. La plataforma no se responsabiliza por problemas técnicos derivados
          del dispositivo o conexión del usuario.
        </p>
        <p>5. El acceso a los cursos es personal e intransferible.</p>
        {/* Podés seguir agregando puntos aquí o cargar desde un archivo si preferís */}
      </div>

      <div className="terms-checkbox">
        <label htmlFor="acceptTerms">
          He leído y acepto los Términos y Condiciones
        </label>
        <input
          type="checkbox"
          id="acceptTerms"
          checked={checked}
          onChange={onChange}
          required
        />
      </div>
    </div>
  );
};

export default TermsCheckbox;
