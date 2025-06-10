import { useState } from "react";
import PresentialFormationForm from "../Form/PresentialFormationForm";
import { createPresentialFormation } from "../../../services/presentialService";
import "./AddItemModal.css";

const AddPresentialFormationModal = ({ onClose, onAdded }) => {
  const [activeTab, setActiveTab] = useState("es"); // 💡 ¡Acá está el fix!

  const handleSave = async (formData) => {
    try {
      const res = await createPresentialFormation(formData);
      onAdded?.(res);
      onClose();
    } catch (err) {
      console.error("❌ Error al crear formación:", err.response?.data || err.message);
      alert("Error al crear formación");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>➕ Agregar Formación Presencial</h2>
        <PresentialFormationForm
          onSave={handleSave}
          onCancel={onClose}
          activeTab={activeTab}           // ✅ ahora sí
          setActiveTab={setActiveTab}     // ✅
        />
      </div>
    </div>
  );
};

export default AddPresentialFormationModal;
