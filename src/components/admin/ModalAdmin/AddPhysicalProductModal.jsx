import PhysicalProductForm from "../Form/PhysicalProductForm";
import { createPhysicalProduct } from "../../../services/physicalProductService";
import "./AddItemModal.css";

const AddPhysicalProductModal = ({ onClose, onAdded }) => {
  const handleSave = async (formData) => {
    try {
      const res = await createPhysicalProduct(formData);
      onAdded?.(res);
      onClose();
    } catch (err) {
      console.error("❌ Error al crear producto:", err.response?.data || err.message);
      alert("Error al crear el producto");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="titulo-principal">Crear nuevo Producto Físico</h2>
        <PhysicalProductForm onSave={handleSave} onCancel={onClose} />
      </div>
    </div>
  );
};

export default AddPhysicalProductModal;
