// services/paymentService.js
import api from "./api";

// ✅ Confirmar compra después del Checkout (opcional para feedback inmediato)
export const confirmarCompraStripe = async (sessionId) => {
  const id = encodeURIComponent(sessionId); // pequeño hardening
  const res = await api.get(`/stripe/confirmar-compra?session_id=${id}`);
  return res.data; // { success, agregados, yaTenia }
};

// Crear sesión de Stripe Checkout
export const crearSesionStripe = async (items) => {
  const res = await api.post("/stripe/crear-sesion", { items });
  return res.data; // { id }
};

// Crear PaymentIntent (Payment Element)
export const crearPaymentIntent = async ({ items, language }) => {
  const res = await api.post("/stripe/crear-payment-intent", { items, language });
  return res.data; // { clientSecret }
};

// Confirmar compra con PaymentIntent (Elements)
export const confirmarCompraConPaymentIntent = async (paymentIntentId) => {
  const res = await api.post("/stripe/confirmar-compra-payment-intent", { paymentIntentId });
  return res.data; // { success, agregados, yaTenia }
};
