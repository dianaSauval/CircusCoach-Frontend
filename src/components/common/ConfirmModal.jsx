import "./ConfirmModal.css";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <h2 className="confirm-title">{title || "¿Estás segura/o?"}</h2>
        <p className="confirm-message">{message || "Esta acción no se puede deshacer."}</p>
        <div className="confirm-buttons">
          <button className="btn cancel" onClick={onClose}>Cancelar</button>
          <button className="btn accept" onClick={onConfirm}>Aceptar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
