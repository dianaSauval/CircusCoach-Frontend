export const PERSONALIZED_SERVICES_CONFIG = [
  {
    id: "reset",
    title: "🔥 RESET",
    subtitle: "Programa grupal transformador",
    shortDescription:
      "Un proceso para artistas que sienten que su entrenamiento ya no alcanza y necesitan reordenar cuerpo, foco y dirección.",
    fullDescription:
      "RESET es un programa grupal pensado para artistas que sienten que entrenan en automático, se exigen sin sentido o se alejaron de lo que aman. La idea no es solamente entrenar más, sino entrenar mejor, con una mirada más clara, más consciente y más alineada con el momento que estás atravesando.",
    options: [
      {
        value: "reset-full-program",
        label: "Programa completo",
      },
    ],
    requiresResetEdition: true,
  },
  {
    id: "coaching",
    title: "🎯 Coaching 1:1",
    subtitle: "Entrenamiento y acompañamiento personalizado",
    shortDescription:
      "Sesiones individuales para trabajar entrenamiento, enfoque, bloqueos, objetivos y acompañamiento más cercano.",
    fullDescription:
      "Este espacio está pensado para quienes necesitan una mirada personalizada. Puede servir para ordenar objetivos, mejorar el entrenamiento, trabajar bloqueos, revisar procesos físicos y mentales o construir un acompañamiento más puntual según lo que estés necesitando.",
    options: [
      {
        value: "coaching-single-session",
        label: "Sesión individual",
      },
      {
        value: "coaching-pack-4",
        label: "Pack de 4 sesiones",
      },
      {
        value: "coaching-custom",
        label: "Pack personalizado",
      },
    ],
    requiresResetEdition: false,
  },
  {
    id: "artistic-direction",
    title: "🎭 Dirección acrobática / artística",
    subtitle: "Mirada externa para tu creación",
    shortDescription:
      "Acompañamiento para números, escenas, materiales en proceso, estructura de actos y mirada externa.",
    fullDescription:
      "Este espacio está orientado a artistas o compañías que necesitan una mirada externa sobre un número, una escena o un proceso de creación. Puede ser desde feedback puntual sobre material grabado hasta sesiones en vivo o acompañamiento más profundo durante un proceso creativo.",
    options: [
      {
        value: "direction-video-feedback",
        label: "Feedback por video",
      },
      {
        value: "direction-live-session",
        label: "Sesión en vivo",
      },
      {
        value: "direction-creative-process",
        label: "Proceso de creación",
      },
    ],
    requiresResetEdition: false,
  },
];

export const getServiceConfigById = (serviceId) =>
  PERSONALIZED_SERVICES_CONFIG.find((service) => service.id === serviceId);

export const getOptionLabel = (selectedOption) => {
  for (const service of PERSONALIZED_SERVICES_CONFIG) {
    const found = service.options.find((option) => option.value === selectedOption);
    if (found) return found.label;
  }
  return "Opción";
};