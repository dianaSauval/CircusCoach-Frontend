import { useEffect, useMemo, useState } from "react";
import {
  getAllResetEditions,
  deleteResetEdition,
  updateResetEdition,
  toggleResetEditionClosed,
} from "../../services/resetEditionService";
import { FaPlus, FaTrash } from "react-icons/fa";
import "../../styles/admin/ManageResetEditions.css";
import ConfirmModal from "../../components/common/ConfirmModal";
import AddResetEditionModal from "../../components/admin/ModalAdmin/AddResetEditionModal";
import ResetEditionForm from "../../components/admin/Form/ResetEditionForm";

const statusLabelMap = {
  open: "Abierta ✅",
  full: "Completa 🟡",
  closed: "Cerrada ⛔️",
  finished: "Finalizada 🏁",
};

const ManageResetEditions = () => {
  const [editions, setEditions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editionToDelete, setEditionToDelete] = useState(null);

  useEffect(() => {
    fetchEditions();
  }, []);

  const fetchEditions = async () => {
    try {
      const data = await getAllResetEditions();
      setEditions(data);

      if (selected?._id) {
        const updatedSelected = data.find((item) => item._id === selected._id);
        setSelected(updatedSelected || null);
      }
    } catch (error) {
      console.error("Error al cargar ediciones RESET:", error);
    }
  };

  const activeEditions = useMemo(
    () => editions.filter((edition) => edition.status !== "finished"),
    [editions],
  );

  const finishedEditions = useMemo(
    () => editions.filter((edition) => edition.status === "finished"),
    [editions],
  );

  const handleDelete = (edition) => {
    setEditionToDelete(edition);
    setShowConfirmModal(true);
  };

  const confirmDeleteEdition = async () => {
    if (!editionToDelete) return;

    try {
      await deleteResetEdition(editionToDelete._id);

      if (selected?._id === editionToDelete._id) {
        setSelected(null);
        setIsEditing(false);
      }

      await fetchEditions();
    } catch (err) {
      console.error("Error al eliminar edición RESET:", err);
      alert(err.response?.data?.error || "No se pudo eliminar la edición.");
    } finally {
      setShowConfirmModal(false);
      setEditionToDelete(null);
    }
  };

  const handleEdit = (edition) => {
    setSelected(edition);
    setIsEditing(true);
  };

  const handleSelectEdition = (edition) => {
    setSelected(edition);
    setIsEditing(false);
  };

  const handleToggleVisible = async (edition) => {
    try {
      const res = await updateResetEdition(edition._id, {
        visible: !edition.visible,
      });

      const updated = res.edition || res;

      setEditions((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      );

      if (selected?._id === updated._id) {
        setSelected(updated);
      }
    } catch (err) {
      console.error("Error al cambiar visibilidad:", err);
      alert(err.response?.data?.error || "No se pudo cambiar la visibilidad.");
    }
  };

  const handleToggleClosed = async (edition) => {
    try {
      const res = await toggleResetEditionClosed(
        edition._id,
        !edition.manuallyClosed,
      );

      const updated = res.edition || res;

      setEditions((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      );

      if (selected?._id === updated._id) {
        setSelected(updated);
      }
    } catch (err) {
      console.error("Error al abrir/cerrar edición:", err);
      alert(err.response?.data?.error || "No se pudo cambiar el estado.");
    }
  };

  const handleSave = async (data) => {
    if (!selected?._id) return;

    try {
      setIsSaving(true);

      const res = await updateResetEdition(selected._id, data);
      const updated = res.edition || res;

      setIsEditing(false);

      setEditions((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      );

      setSelected(updated);
    } catch (err) {
      console.error("Error al guardar edición RESET:", err);
      alert(err.response?.data?.error || "No se pudo guardar la edición.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-ES");
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const renderEditionCard = (edition) => {
    const isSelected = selected?._id === edition._id;
    const canDelete = edition.status === "finished";

    return (
      <div
        key={edition._id}
        className={`reset-card ${isSelected ? "selected" : ""}`}
      >
        <div
          className="titulo-principal reset-title"
          onClick={() => handleSelectEdition(edition)}
          style={{ cursor: "pointer", width: "100%" }}
        >
          <span className="reset-title-text">
            {edition.title || "Sin título"}
          </span>
        </div>

        <div className="reset-information">
          <p>
            <strong>Inicio:</strong> {formatDate(edition.startDate)}
          </p>
          <p>
            <strong>Visible:</strong> {edition.visible ? "Sí ✅" : "No ⛔️"}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            {statusLabelMap[edition.status] || edition.status}
          </p>
          <p>
            <strong>Cupos:</strong> {edition.occupiedSpots || 0}/
            {edition.capacity || 0}
          </p>
          <p>
            <strong>Precio:</strong> €{Number(edition.price || 0).toFixed(2)}
          </p>
          <p>
            <strong>Grupo de WhatsApp:</strong>{" "}
            {edition?.whatsappGroupLink ? (
              <a
                href={edition.whatsappGroupLink}
                target="_blank"
                rel="noreferrer"
              >
                Ver enlace
              </a>
            ) : (
              "No cargado"
            )}
          </p>
        </div>

        <div className="reset-actions">
          {edition.status !== "finished" && (
            <button
              className="boton-agregar editar"
              onClick={() => handleEdit(edition)}
            >
              ✏️ Editar
            </button>
          )}

          <button
            className="boton-agregar editar"
            onClick={() => handleToggleVisible(edition)}
          >
            👁️ {edition.visible ? "Ocultar" : "Mostrar"}
          </button>

          {edition.status !== "finished" && (
            <button
              className="boton-agregar editar"
              onClick={() => handleToggleClosed(edition)}
            >
              {edition.manuallyClosed ? "🔓 Reabrir" : "🔒 Cerrar"}
            </button>
          )}

          {canDelete && (
            <button
              className="boton-eliminar"
              onClick={() => handleDelete(edition)}
            >
              <FaTrash /> Eliminar
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="manage-reset-container">
      <h1 className="main-title">🔥 Ediciones RESET</h1>

      <div className="reset-layout">
        {/* LISTA IZQUIERDA */}
        <div className="reset-list">
          <h2 className="titulo-principal">Ediciones activas</h2>

          <button
            className="boton-agregar agregar-reset"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Crear nueva edición
          </button>

          {activeEditions.length > 0 ? (
            activeEditions.map(renderEditionCard)
          ) : (
            <p className="reset-notes-empty">No hay ediciones activas.</p>
          )}

          <h2 className="titulo-principal" style={{ marginTop: "2rem" }}>
            Realizados
          </h2>

          {finishedEditions.length > 0 ? (
            finishedEditions.map(renderEditionCard)
          ) : (
            <p className="reset-notes-empty">No hay ediciones finalizadas.</p>
          )}
        </div>

        {/* PANEL DERECHO */}
        {selected && (
          <div className="reset-edit-panel">
            {isEditing ? (
              <ResetEditionForm
                initialData={selected}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
                isSaving={isSaving}
              />
            ) : (
              <div className="reset-information-panel">
                <h2 className="titulo-principal reset-panel-title">
                  {selected.title || "Sin título"}
                </h2>

                <div className="reset-highlight-box">
                  <div className="reset-highlight-item">
                    <span className="reset-highlight-label">Inicio</span>
                    <strong>{formatDate(selected.startDate)}</strong>
                  </div>

                  <div className="reset-highlight-item">
                    <span className="reset-highlight-label">Duración</span>
                    <strong>{selected.durationWeeks || 0} semanas</strong>
                  </div>

                  <div className="reset-highlight-item">
                    <span className="reset-highlight-label">Precio</span>
                    <strong>€{Number(selected.price || 0).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="reset-information">
                  <p>
                    <strong>Total de encuentros:</strong>{" "}
                    {selected.totalSessions || 0}
                  </p>

                  <p>
                    <strong>Capacidad:</strong> {selected.capacity || 0}
                  </p>

                  <p>
                    <strong>Pagados:</strong> {selected.occupiedSpots || 0}
                  </p>

                  <p>
                    <strong>Cupos disponibles:</strong>{" "}
                    {selected.availableSpots || 0}
                  </p>

                  <p>
                    <strong>Estado:</strong>{" "}
                    {statusLabelMap[selected.status] || selected.status}
                  </p>

                  <p>
                    <strong>Visible:</strong>{" "}
                    {selected.visible ? "Sí ✅" : "No ⛔️"}
                  </p>

                  <p>
                    <strong>Inscripción manual:</strong>{" "}
                    {selected.manuallyClosed ? "Cerrada 🔒" : "Abierta 🔓"}
                  </p>

                  <p>
                    <strong>Creada:</strong> {formatDate(selected.createdAt)}
                  </p>

                  <p>
                    <strong>Actualizada:</strong>{" "}
                    {formatDate(selected.updatedAt)}
                  </p>
                </div>

                <div className="reset-notes-block">
                  <div className="reset-notes-header">
                    <strong>📅 Encuentros</strong>
                  </div>

                  {selected.sessions?.length > 0 ? (
                    <ul className="reset-sessions-view">
                      {selected.sessions.map((session, index) => (
                        <li key={session._id || index}>
                          <strong>Encuentro {index + 1}:</strong>{" "}
                          {formatDateTime(session.date)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="reset-notes-empty">
                      No hay encuentros cargados.
                    </p>
                  )}
                </div>

                <div className="reset-notes-block">
                  <div className="reset-notes-header">
                    <strong>👥 Participantes pagos</strong>
                  </div>

                  {selected.paidParticipants?.length > 0 ? (
                    <ul className="reset-sessions-view">
                      {selected.paidParticipants.map((participant) => (
                        <li key={participant._id}>
                          {participant.firstName} {participant.lastName}
                          {participant.email ? ` — ${participant.email}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="reset-notes-empty">
                      Todavía no hay participantes pagos.
                    </p>
                  )}
                </div>

                <div className="reset-notes-block">
                  <div className="reset-notes-header">
                    <strong>📝 Notas internas</strong>
                  </div>

                  {selected.notes ? (
                    <p className="texto">{selected.notes}</p>
                  ) : (
                    <p className="reset-notes-empty">
                      No hay notas cargadas para esta edición.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddResetEditionModal
          onClose={() => setShowAddModal(false)}
          onAdded={(newEdition) => {
            setEditions((prev) => [...prev, newEdition]);
            setSelected(newEdition);
            setShowAddModal(false);
          }}
        />
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDeleteEdition}
        title="¿Eliminar edición RESET?"
        message={`¿Estás segura/o de eliminar "${
          editionToDelete?.title || "esta edición"
        }"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default ManageResetEditions;
