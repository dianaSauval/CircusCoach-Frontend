import BookForm from "../Form/BookForm";
import { createBook } from "../../../services/bookService";
import "./AddItemModal.css";

const AddBookModal = ({ onClose, onAdded }) => {
  const handleSave = async (formData) => {
    try {
      const res = await createBook(formData);
      onAdded?.(res);
      onClose();
    } catch (err) {
      console.error("❌ Error al crear libro:", err.response?.data || err.message);
      alert("Error al crear el libro");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="titulo-principal">Crear nuevo Libro</h2>
        <BookForm onSave={handleSave} onCancel={onClose} />
      </div>
    </div>
  );
};

export default AddBookModal;
