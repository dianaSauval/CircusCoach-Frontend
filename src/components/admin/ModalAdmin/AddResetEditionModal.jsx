import { useState } from "react";
import ResetEditionForm from "../Form/ResetEditionForm";
import { createResetEdition } from "../../../services/resetEditionService";
import "./AddItemModal.css";

const AddResetEditionModal = ({ onClose, onAdded }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async (formData) => {
    try {
      setIsSaving(true);
      setErrorMessage("");

      const res = await createResetEdition(formData);
      const newEdition = res.edition || res;

      onAdded?.(newEdition);
      onClose();
    } catch (err) {
      console.error(
        "❌ Error al crear edición RESET:",
        err.response?.data || err.message
      );

      setErrorMessage(
        err.response?.data?.error || "Error al crear la edición RESET"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="titulo-principal">Crear nueva edición RESET</h2>

        {errorMessage && (
          <p className="modal-error-message">{errorMessage}</p>
        )}

        <ResetEditionForm
          onSave={handleSave}
          onCancel={onClose}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};

export default AddResetEditionModal;