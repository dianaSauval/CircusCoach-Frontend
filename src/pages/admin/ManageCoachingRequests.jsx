import { useEffect, useMemo, useState } from "react";
import {
  getAllPersonalizedServiceRequests,
  approvePersonalizedServiceRequest,
  rejectPersonalizedServiceRequest,
  setCustomPriceForRequest,
} from "../../services/personalizedServiceService";
import RequestDecisionModal from "../../components/admin/ModalAdmin/RequestDecisionModal";
import RequestCard from "../../components/admin/RequestCard/RequestCard";
import "../../styles/admin/ManageCoachingRequests.css";

function ManageCoachingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    serviceType: "",
    resetEditionId: "",
  });
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [customPrices, setCustomPrices] = useState({});
  const [decisionModal, setDecisionModal] = useState({
    isOpen: false,
    mode: "approve",
    request: null,
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllPersonalizedServiceRequests(filters);
      setRequests(data);

      setSelectedRequestId((prev) =>
        data.some((item) => item._id === prev) ? prev : null,
      );
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters.status, filters.serviceType, filters.resetEditionId]);

  const resetEditionOptions = useMemo(() => {
    const editionsMap = new Map();

    requests.forEach((request) => {
      if (request.resetEdition?._id && request.resetEdition?.title) {
        editionsMap.set(request.resetEdition._id, request.resetEdition.title);
      }
    });

    return Array.from(editionsMap.entries()).map(([id, title]) => ({
      id,
      title,
    }));
  }, [requests]);

  const counts = useMemo(() => {
    return requests.reduce(
      (acc, request) => {
        if (acc[request.status] !== undefined) {
          acc[request.status] += 1;
        }
        return acc;
      },
      {
        pending: 0,
        approved: 0,
        rejected: 0,
        paid: 0,
      },
    );
  }, [requests]);

  const openDecisionModal = (mode, request) => {
    setDecisionModal({
      isOpen: true,
      mode,
      request,
    });
  };

  const closeDecisionModal = () => {
    if (actionLoadingId) return;

    setDecisionModal({
      isOpen: false,
      mode: "approve",
      request: null,
    });
  };

  const handleConfirmDecision = async (adminNotes) => {
    if (!decisionModal.request?._id) return;

    try {
      setActionLoadingId(decisionModal.request._id);

      if (decisionModal.mode === "approve") {
        await approvePersonalizedServiceRequest(decisionModal.request._id, {
          adminNotes,
        });
      } else {
        await rejectPersonalizedServiceRequest(decisionModal.request._id, {
          adminNotes,
        });
      }

      closeDecisionModal();
      await fetchRequests();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.error ||
          `No se pudo ${
            decisionModal.mode === "approve" ? "aprobar" : "rechazar"
          } la solicitud.`,
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSelectCard = (requestId) => {
    setSelectedRequestId((prev) => (prev === requestId ? null : requestId));
  };

  const handleCustomPriceChange = (requestId, value) => {
    setCustomPrices((prev) => ({
      ...prev,
      [requestId]: value,
    }));
  };

  const handleSetPrice = async (requestId) => {
    const price = customPrices[requestId];

    if (!price || Number(price) <= 0) {
      alert("Ingresá un precio válido");
      return;
    }

    try {
      setActionLoadingId(requestId);

      await setCustomPriceForRequest(requestId, Number(price));

      await fetchRequests();
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el precio");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="manage-coaching-requests">
      <section className="manage-coaching-requests__hero">
        <p className="manage-coaching-requests__eyebrow">
          Panel de administración
        </p>
        <h1 className="titulo-principal">Solicitudes de Coaching</h1>
        <p className="texto manage-coaching-requests__intro">
          Revisá las solicitudes recibidas, filtrá por servicio o estado y
          decidí cuáles querés aprobar según tu agenda.
        </p>
      </section>

      <section className="manage-coaching-requests__summary">
        <div className="summary-chip summary-chip--pending">
          <span className="summary-chip__label">Pendientes</span>
          <span className="summary-chip__value">{counts.pending}</span>
        </div>
        <div className="summary-chip summary-chip--approved">
          <span className="summary-chip__label">Aprobadas</span>
          <span className="summary-chip__value">{counts.approved}</span>
        </div>
        <div className="summary-chip summary-chip--paid">
          <span className="summary-chip__label">Pagadas</span>
          <span className="summary-chip__value">{counts.paid}</span>
        </div>
        <div className="summary-chip summary-chip--rejected">
          <span className="summary-chip__label">Rechazadas</span>
          <span className="summary-chip__value">{counts.rejected}</span>
        </div>
      </section>

      <section className="manage-coaching-requests__filters-box">
        <div className="manage-coaching-requests__filters-header">
          <h2 className="manage-coaching-requests__filters-title">Filtros</h2>
          <button onClick={fetchRequests} className="boton-secundario">
            Actualizar
          </button>
        </div>

        <div className="manage-coaching-requests__filters">
          <div className="manage-coaching-requests__field">
            <label className="label-formulario">Estado</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="paid">Pagadas</option>
            </select>
          </div>

          <div className="manage-coaching-requests__field">
            <label className="label-formulario">Servicio</label>
            <select
              value={filters.serviceType}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  serviceType: e.target.value,
                  resetEditionId: "",
                }))
              }
            >
              <option value="">Todos los servicios</option>
              <option value="reset">RESET</option>
              <option value="coaching">Coaching 1:1</option>
              <option value="artistic-direction">Dirección artística</option>
            </select>
          </div>

          {filters.serviceType === "reset" && (
            <div className="manage-coaching-requests__field">
              <label className="label-formulario">Edición RESET</label>
              <select
                value={filters.resetEditionId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    resetEditionId: e.target.value,
                  }))
                }
              >
                <option value="">Todas las ediciones RESET</option>
                {resetEditionOptions.map((edition) => (
                  <option key={edition.id} value={edition.id}>
                    {edition.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {loading && (
        <div className="manage-coaching-requests__state">
          <p className="texto">Cargando solicitudes...</p>
        </div>
      )}

      {error && <p className="manage-coaching-requests__error">{error}</p>}

      {!loading && !error && requests.length === 0 && (
        <div className="manage-coaching-requests__empty">
          <p className="texto">No hay solicitudes para mostrar.</p>
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="manage-coaching-requests__results">
          <p className="manage-coaching-requests__count">
            {requests.length} solicitud{requests.length !== 1 ? "es" : ""}
          </p>

          <div
            className={`manage-coaching-requests__list ${
              selectedRequestId
                ? "manage-coaching-requests__list--has-selection"
                : ""
            }`}
          >
            {requests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                isSelected={selectedRequestId === request._id}
                actionLoadingId={actionLoadingId}
                customPrice={customPrices[request._id]}
                onSelect={() => handleSelectCard(request._id)}
                onApprove={() => openDecisionModal("approve", request)}
                onReject={() => openDecisionModal("reject", request)}
                onCustomPriceChange={(value) =>
                  handleCustomPriceChange(request._id, value)
                }
                onSetPrice={() => handleSetPrice(request._id)}
              />
            ))}
          </div>
        </div>
      )}

      <RequestDecisionModal
        isOpen={decisionModal.isOpen}
        mode={decisionModal.mode}
        requestData={decisionModal.request}
        loading={
          !!actionLoadingId && actionLoadingId === decisionModal.request?._id
        }
        onClose={closeDecisionModal}
        onConfirm={handleConfirmDecision}
      />
    </div>
  );
}

export default ManageCoachingRequests;
