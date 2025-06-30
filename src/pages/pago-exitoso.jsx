import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  confirmarCompraStripe,
  confirmarCompraConPaymentIntent,
} from "../services/paymentService";
import "../styles/pages/PagoExitoso.css";

export default function PagoExitoso() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { setCart } = useCart();
  const [mensaje, setMensaje] = useState("Procesando tu compra...");
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || confirmado) return;

    const sessionId = searchParams.get("session_id");
    const paymentIntentId = searchParams.get("payment_intent");

    if (!sessionId && !paymentIntentId) {
      setMensaje("❌ No se detectó ningún intento de pago.");
      return;
    }

    const confirmarCompra = async () => {
      try {
        if (sessionId) {
          const res = await confirmarCompraStripe(sessionId);
          if (res.success) {
            setMensaje("¡Gracias por tu compra! Ya podés acceder a tu contenido 🎉");
            setCart([]);
          } else {
            setMensaje("⚠️ Hubo un problema al registrar tu compra.");
          }
        } else if (paymentIntentId) {
          const res = await confirmarCompraConPaymentIntent(paymentIntentId);
          if (res.success) {
            setMensaje("¡Gracias por tu compra! Ya podés acceder a tu contenido 🎉");
            setCart([]);
          } else {
            setMensaje("⚠️ Hubo un problema al registrar tu compra.");
          }
        }

        setConfirmado(true); // para evitar múltiples llamadas
      } catch (err) {
        console.error(err);
        setMensaje("❌ Error al conectar con el servidor.");
      }
    };

    confirmarCompra();
  }, [isAuthenticated, searchParams, confirmado, setCart]);

  return (
    <div className="pago-exitoso-container">
      <div className="mensaje-box">
        <h1 className="titulo">{mensaje}</h1>
        <p className="detalle">
          Te esperamos en la sección <strong>Mis Cursos</strong> para que empieces tu recorrido 💫
        </p>
      </div>
    </div>
  );
}
