import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { confirmarCompraStripe } from "../services/paymentService";
import "../styles/pages/PagoExitoso.css"; // ⬅️ agregamos un CSS separado

export default function PagoExitoso() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { setCart } = useCart();
  const [mensaje, setMensaje] = useState("Procesando tu compra...");

  useEffect(() => {
    const confirmarCompra = async () => {
      const sessionId = searchParams.get("session_id");
      if (!sessionId || !isAuthenticated) return;

      try {
        const res = await confirmarCompraStripe(sessionId);
        if (res.success) {
          setMensaje("¡Gracias por tu compra! Ya podés acceder a tu contenido 🎉");
          setCart([]);
        } else {
          setMensaje("⚠️ Hubo un problema al registrar tu compra.");
        }
      } catch (err) {
        console.error(err);
        setMensaje("❌ Error al conectar con el servidor.");
      }
    };

    confirmarCompra();
  }, [searchParams, isAuthenticated]);

  return (
    <div className="pago-exitoso-container">
      <div className="mensaje-box">
        <h1 className="titulo">{mensaje}</h1>
        <p className="detalle">Te esperamos en la sección <strong>Mis Cursos</strong> para que empieces tu recorrido 💫</p>
      </div>
    </div>
  );
}
