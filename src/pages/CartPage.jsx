// ✅ PÁGINA DE CARRITO (pages/CartPage.jsx)
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import translations from "../i18n/translations";
import EmptyState from "../components/EmptyState/EmptyState";
import "../styles/pages/CartPage.css";
import { loadStripe } from "@stripe/stripe-js";
import { crearSesionStripe } from "../services/paymentService";
import TermsCheckbox from "../components/common/TermsCheckbox/TermsCheckbox";
import { useState } from "react";


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function CartPage() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { cart, cartCount, setCart } = useCart();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const t = translations.cart[language];

  const handleClearCart = () => setCart([]);

  const handleCheckout = async () => {
    try {
      const data = await crearSesionStripe(cart);
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err) {
      console.error("Error al iniciar el pago:", err);
      alert("❌ No se pudo iniciar el pago.");
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  if (!isAuthenticated) {
    return (
      <EmptyState
        title={t.loginRequiredTitle}
        subtitle={t.loginRequiredSubtitle}
      />
    );
  }

  return (
    <div className="cart-page-container">
      <h1>{t.title}</h1>

      {cartCount === 0 ? (
        <EmptyState title={t.emptyTitle} subtitle={t.emptySubtitle} />
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item, index) => (
              <li key={index} className="cart-item">
                <img
                  src={
                    item.image?.[language] ||
                    item.image?.es ||
                    "/placeholder.png"
                  }
                  alt={item.title?.[language] || item.title?.es || "Curso"}
                  className="cart-item-img"
                />
                <div className="cart-item-info">
                  <h3>{item.title?.[language] || item.title?.es}</h3>
                  <p>USD {item.price}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <p className="total-label">{t.total}:</p>
            <p className="total-amount">USD {totalPrice.toFixed(2)}</p>
          </div>
<TermsCheckbox
  checked={termsAccepted}
  onChange={(e) => setTermsAccepted(e.target.checked)}
  termsUrl="https://docs.google.com/document/d/1FSbvt75QDQxrmPJVhnGuCZPLCp7vkE3Zi341OFJtLWw/edit"
/>
          <div className="cart-buttons">
            <button onClick={handleClearCart} className="btn-clear">
              {t.clear}
            </button>
<button
  onClick={handleCheckout}
 className={`btn-buy ${!termsAccepted ? "disabled" : ""}`}

  disabled={cartCount === 0 || !termsAccepted}
>
  {t.buy}
</button>
          </div>
        </>
      )}
    </div>
  );
}
