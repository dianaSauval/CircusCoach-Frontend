import DiscountForm from "../Form/DiscountForm";
import { createDiscount } from "../../../services/discountService";
import "./AddItemModal.css";

const AddDiscountModal = ({ onClose, onAdded }) => {
  const handleSave = async (formData) => {
    try {
      const res = await createDiscount(formData);
      onAdded?.(res); // Actualiza la lista en el panel
      onClose(); // Cierra el modal
    } catch (err) {
      console.error("❌ Error al crear bono:", err.response?.data || err.message);
      alert("Error al crear el bono");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="titulo-principal">Crear nuevo Bono de Descuento</h2>
        <DiscountForm onSave={handleSave} onCancel={onClose} />
      </div>
    </div>
  );
};

export default AddDiscountModal;
