// services/paymentService.js
import api from "./api";

// Simulación de compra directa
export const simulatePurchase = async (items) => {
  const res = await api.post("/pagos/compras-simuladas", { items });
  return res.data;
};


// Confirmar compra con Stripe después del pago
export const confirmarCompraStripe = async (sessionId) => {
  const res = await api.get(`/stripe/confirmar-compra?session_id=${sessionId}`);
  return res.data;
};


export const crearSesionStripe = async (items) => {
  const res = await api.post("/stripe/crear-sesion", { items });
  return res.data; // devuelve { id }
};

// Crear PaymentIntent y obtener clientSecret (para PaymentElement)
export const crearPaymentIntent = async (items) => {
  const res = await api.post("/stripe/crear-payment-intent", { items });
  return res.data; // devuelve { clientSecret }
};

// Confirmar compra con PaymentIntent (Stripe Elements)
export const confirmarCompraConPaymentIntent = async (paymentIntentId) => {
  const res = await api.post("/stripe/confirmar-compra-payment-intent", {
    paymentIntentId,
  });
  return res.data;
};
