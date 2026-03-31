import { useState } from "react";
import ServiceCard from "../ServiceCard/ServiceCard";
import ServiceDetailsModal from "../ServiceDetailsModal/ServiceDetailsModal";
import "./ServicesSection.css";

function ServicesSection({
  services,
  selectedService,
  onSelectService,
  resetEditions = [],
}) {
  const [activeModalService, setActiveModalService] = useState(null);

  const handleOpenModal = (service) => {
    setActiveModalService(service);
  };

  const handleCloseModal = () => {
    setActiveModalService(null);
  };

  return (
    <section className="consultoria-services">
      <div className="consultoria-section-heading">
        <h2>Trabajá conmigo</h2>
        <p>
          Elegí el tipo de acompañamiento que necesitás y, si querés, podés leer
          más antes de enviar tu solicitud.
        </p>
      </div>

      <div className="consultoria-cards">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedService === service.id}
            onOpenModal={handleOpenModal}
            onSelect={onSelectService}
            resetEditions={resetEditions}
          />
        ))}
      </div>

      <ServiceDetailsModal
        service={activeModalService}
        isOpen={!!activeModalService}
        onClose={handleCloseModal}
        onSelect={onSelectService}
        resetEditions={resetEditions}
      />
    </section>
  );
}

export default ServicesSection;