import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { createPersonalizedServiceRequest } from "../services/personalizedServiceService";
import { getPublicResetEditions } from "../services/resetEditionService";
import { INITIAL_FORM, SERVICES } from "../data/personalizedServicesData";
import ConsultationHero from "../components/consultoria/ConsultationHero/ConsultationHero";
import ServicesSection from "../components/consultoria/ServicesSection/ServicesSection";
import ConsultationRequestForm from "../components/consultoria/ConsultationRequestForm/ConsultationRequestForm";
import "../styles/pages/ConsultoriaPersonalPage.css";

function ConsultoriaPersonalPage() {
  const [selectedService, setSelectedService] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [resetEditions, setResetEditions] = useState([]);
  const [loadingEditions, setLoadingEditions] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  const selectedServiceConfig = useMemo(
    () => SERVICES.find((service) => service.id === selectedService),
    [selectedService],
  );

  const selectedResetEdition = useMemo(() => {
    if (!formData.resetEdition) return null;
    return (
      resetEditions.find((edition) => edition._id === formData.resetEdition) ||
      null
    );
  }, [formData.resetEdition, resetEditions]);

  useEffect(() => {
    const fetchEditions = async () => {
      try {
        setLoadingEditions(true);
        const editions = await getPublicResetEditions();
        setResetEditions(editions || []);
      } catch (error) {
        console.error("Error obteniendo ediciones públicas de RESET:", error);
      } finally {
        setLoadingEditions(false);
      }
    };

    fetchEditions();
  }, []);

  const handleSelectService = (serviceId) => {
    if (!serviceId) {
      setSelectedService("");
      setFormData((prev) => ({
        ...prev,
        serviceType: "",
        selectedOption: "",
        resetEdition: "",
      }));
      return;
    }

    const serviceConfig = SERVICES.find((service) => service.id === serviceId);
    const defaultOption = serviceConfig?.options?.[0]?.value || "";

    setSelectedService(serviceId);
    setSubmitSuccess("");
    setSubmitError("");

    setFormData((prev) => ({
      ...prev,
      serviceType: serviceId,
      selectedOption: defaultOption,
      resetEdition: "",
    }));

    const section = document.getElementById("consultoria-formulario");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return "El nombre es obligatorio.";
    if (!formData.email.trim()) return "El email es obligatorio.";
    if (!formData.serviceType) return "Tenés que elegir un servicio.";
    if (!formData.selectedOption) return "Tenés que elegir una opción.";
    if (!formData.experience.trim()) {
      return "Contanos brevemente tu experiencia previa.";
    }

    if (
      formData.serviceType === "reset" &&
      selectedServiceConfig?.requiresResetEdition &&
      !formData.resetEdition
    ) {
      return "Para RESET tenés que elegir una fecha de comienzo.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitSuccess("");
    setSubmitError("");

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        whatsapp: formData.whatsapp.trim(),
        serviceType: formData.serviceType,
        selectedOption: formData.selectedOption,
        experience: formData.experience.trim(),
        message: formData.message.trim(),
        language: formData.language,
        ...(formData.serviceType === "reset"
          ? { resetEdition: formData.resetEdition }
          : {}),
      };

      await createPersonalizedServiceRequest(payload);

      const customPriceOptions = [
        "coaching-custom",
        "direction-creative-process",
      ];

      const isCustomPriceOption = customPriceOptions.includes(
        formData.selectedOption,
      );

      setSubmitSuccess(
        isCustomPriceOption
          ? "Tu solicitud fue enviada correctamente. Rocío la revisará, definirá una propuesta con precio personalizado y, si corresponde, te enviará el link de pago por email."
          : "Tu solicitud fue enviada correctamente. Rocío la revisará y, si corresponde, te enviará el link de pago por email.",
      );

      setFormData((prev) => ({
        ...INITIAL_FORM,
        language: prev.language,
      }));
      setSelectedService("");
    } catch (error) {
      console.error("Error enviando solicitud:", error);
      setSubmitError(
        error?.response?.data?.error ||
          "No se pudo enviar la solicitud. Intentá nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Helmet>
        <title>Consultoría personal | CircusCoach</title>
        <meta
          name="description"
          content="Solicitá acompañamiento personalizado con Rocío Garrote: RESET, coaching 1:1 y mirada externa."
        />
        <link
          rel="canonical"
          href="https://www.mycircuscoach.com/consultoria-personal"
        />
      </Helmet>

      <main className="consultoria-page">
        <ConsultationHero />

        <ServicesSection
          services={SERVICES}
          selectedService={selectedService}
          onSelectService={handleSelectService}
          resetEditions={resetEditions}
        />

        <ConsultationRequestForm
          services={SERVICES}
          formData={formData}
          selectedServiceConfig={selectedServiceConfig}
          resetEditions={resetEditions}
          selectedResetEdition={selectedResetEdition}
          loadingEditions={loadingEditions}
          submitting={submitting}
          submitError={submitError}
          submitSuccess={submitSuccess}
          onChange={handleChange}
          onSelectService={handleSelectService}
          onSubmit={handleSubmit}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
        />
      </main>
    </>
  );
}

export default ConsultoriaPersonalPage;
