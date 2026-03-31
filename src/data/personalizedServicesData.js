export const SERVICES = [
  {
    id: "reset",
    title: "🔥 RESET",
    subtitle: "Programa grupal transformador",
    shortText:
      "Cuando seguir no es la solución. Un proceso para artistas que sienten que entrenan en automático y necesitan resetear su práctica.",
    fullText: `Cuando seguir no es la solución.
Llega un momento en el que entrenar más ya no sirve.
El cuerpo se cansa.
La cabeza no para.
Y lo que antes te daba placer… empieza a pesar.
Pero en vez de frenar, seguís.
Porque no sabés hacer otra cosa.

RESET es para ese momento.
No es un programa para mejorar tu técnica.
Es un espacio para revisar todo lo que estás sosteniendo sin darte cuenta.
Para salir del piloto automático.
Para entender qué te está pasando.
Y para reconstruir tu práctica desde un lugar más honesto.
No venís a rendir.
Venís a resetear.`,
    bullets: [
      "Para artistas bloqueados, en crisis o estancados",
      "Clases + acompañamiento",
      "Enfoque mental + físico",
      "Duración: 4 semanas",
    ],
    prices: ["Programa completo: 250€"],
    buttonText: "🔥 Necesito un RESET",
    submitText: "Quiero hacer RESET",
    options: [
      {
        value: "reset-full-program",
        label: "RESET – Programa completo",
      },
    ],
    requiresResetEdition: true,
  },
  {
    id: "coaching",
    title: "🎯 Coaching 1:1",
    subtitle: "Entrenamiento y acompañamiento personalizado",
    shortText:
      "Para mirar de frente lo técnico, lo creativo o lo mental. Un espacio individual para trabajar en serio.",
    fullText: `Dejar de entrenar en automático.
Podés seguir entrenando como siempre.
O podés empezar a trabajar de verdad.

Este espacio es para mirar de frente lo que estás evitando:
lo técnico, lo creativo o lo mental.
A veces es falta de claridad.
A veces es miedo.
A veces es agotamiento disfrazado de disciplina.

No hay fórmulas.
Hay proceso.
Y sí, a veces incomoda.
Pero también es donde las cosas cambian.`,
    bullets: [
      "Técnica y entrenamiento en tu disciplina",
      "Preparación física adaptada",
      "Creación artística y desarrollo de número",
      "Bloqueos, estrés escénico y perfeccionismo",
    ],
    prices: [
      "Sesión individual (60 min): 80€",
      "Pack de 4 sesiones: 300€",
      "Otro pack: a discutir",
    ],
    buttonText: "🎯 Quiero trabajar 1:1",
    submitText: "Quiero trabajar en serio",
    options: [
      {
        value: "coaching-single-session",
        label: "Sesión individual (60 min) · 80€",
      },
      {
        value: "coaching-pack-4",
        label: "Pack de 4 sesiones · 300€",
      },
      {
        value: "coaching-custom",
        label: "Otro pack · A discutir",
      },
    ],
    requiresResetEdition: false,
  },
  {
    id: "artistic-direction",
    title: "🎭 Mirada externa",
    subtitle: "Dirección artística y/o acrobática",
    shortText:
      "Una mirada externa, honesta y precisa para ordenar, recortar y potenciar tu trabajo.",
    fullText: `Lo que vos no estás viendo.
Hay algo que no cierra en tu número.
Lo sentís.
Pero no sabés qué es.

Probás, cambiás cosas, entrenás más…
y sin embargo, sigue sin funcionar.
Porque estás demasiado adentro.

Esta es una mirada externa, honesta y precisa sobre tu trabajo.
Para cortar con lo que sobra.
Para ordenar lo que está confuso.
Y para potenciar lo que ya está, pero todavía no aparece.
No es siempre cómodo.
Pero es claro.`,
    bullets: [
      "Feedback sobre número por video",
      "Sesión en vivo",
      "Acompañamiento en creación",
      "Dirección de espectáculo / proceso",
    ],
    prices: [
      "Feedback por video: 60€",
      "Sesión en vivo: 90€",
      "Proceso de creación: a discutir",
    ],
    buttonText: "🎭 Quiero una mirada externa",
    submitText: "Necesito otra mirada",
    options: [
      {
        value: "direction-video-feedback",
        label: "Feedback por video · 60€",
      },
      {
        value: "direction-live-session",
        label: "Sesión en vivo · 90€",
      },
      {
        value: "direction-creative-process",
        label: "Proceso de creación · A discutir",
      },
    ],
    requiresResetEdition: false,
  },
];

export const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  whatsapp: "",
  serviceType: "",
  selectedOption: "",
  experience: "",
  message: "",
  language: "es",
  resetEdition: "",
};