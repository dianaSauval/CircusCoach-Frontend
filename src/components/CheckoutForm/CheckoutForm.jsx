import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { confirmarCompraConPaymentIntent } from "../../services/paymentService";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { setCart } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {}, // ❌ NO usamos return_url
        redirect: "if_required", // ✅ Manejamos todo desde frontend
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        await confirmarCompraConPaymentIntent(paymentIntent.id);
        setCart([]);
       navigate(`/pago-exitoso?payment_intent=${paymentIntent.id}`);
      } else {
        setError("El pago no se completó correctamente.");
      }
    } catch (err) {
      console.error("Error en el pago:", err);
      setError("Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={!stripe || isLoading}>
        {isLoading ? "Procesando..." : "Pagar"}
      </button>
    </form>
  );
};

export default CheckoutForm;
