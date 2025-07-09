import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../components/CheckoutForm/CheckoutForm";
import { crearPaymentIntent } from "../services/paymentService";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import translations from "../i18n/translations";
import TermsCheckbox from "../components/common/TermsCheckbox/TermsCheckbox";
import EmptyState from "../components/EmptyState/EmptyState";
import "../styles/pages/PagoEmbedPage.css"; // mismo estilo que CartPage

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PagoEmbedPage = () => {
  const [clientSecret, setClientSecret] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { cart, cartCount, setCart } = useCart();
  const { language } = useLanguage();
  const t = translations.cart[language];

  const calcularPrecioConDescuento = (item) => {
    if (!item.discount || !item.discount.percentage) return item.price;
    return item.price - (item.price * item.discount.percentage) / 100;
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + calcularPrecioConDescuento(item),
    0
  );

  useEffect(() => {
    const obtenerClientSecret = async () => {
      try {
        const res = await crearPaymentIntent(cart);
        setClientSecret(res.clientSecret);
      } catch (err) {
        console.error("Error al obtener clientSecret", err);
      }
    };

    if (cart.length > 0) {
      obtenerClientSecret();
    }
  }, [cart]);

  const handleRemoveItem = (indexToRemove) => {
    const newCart = cart.filter((_, index) => index !== indexToRemove);
    setCart(newCart);
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const appearance = { theme: "stripe" };
  const options = { clientSecret, appearance };

  if (cartCount === 0) {
    return <EmptyState title={t.emptyTitle} subtitle={t.emptySubtitle} />;
  }

  return (
    <div className="cart-page-container">
      <h1>{t.title}</h1>

      <ul className="cart-list">
        {cart.map((item, index) => (
         

          <li key={index} className="cart-item">
            <img
              src={
                item.image?.[language] || item.image?.es || "/placeholder.png"
              }
              alt={item.title?.[language] || item.title?.es || "Curso"}
              className="cart-item-img"
            />
            <div className="cart-item-info">
              <h3 className="titulo-principal">
                {item.title?.[language] || item.title?.es}
              </h3>
              {item.discount ? (
                <div className="precio-con-descuento">
                  <span className="precio-final">
                    USD {calcularPrecioConDescuento(item).toFixed(2)}
                  </span>
                  <span className="precio-original">
                    USD {item.price.toFixed(2)}
                  </span>
                  <span className="nombre-descuento">
                    🎁 {item.discount.name} - {item.discount.percentage}% OFF
                  </span>
                </div>
              ) : (
                <p className="precio-normal">USD {item.price.toFixed(2)}</p>
              )}

              <button
                className="boton-eliminar small"
                onClick={() => handleRemoveItem(index)}
              >
                🗑 Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <p className="label-formulario">{t.total}:</p>
        <p className="texto">USD {totalPrice.toFixed(2)}</p>
      </div>

      <TermsCheckbox
        checked={termsAccepted}
        onChange={(e) => setTermsAccepted(e.target.checked)}
        termsUrl="https://docs.google.com/document/d/1FSbvt75QDQxrmPJVhnGuCZPLCp7vkE3Zi341OFJtLWw/edit"
      />

      {!termsAccepted && (
        <p style={{ color: "red", marginTop: "0.5rem" }}>
          {t.acceptTermsWarning || "Debes aceptar los términos para continuar."}
        </p>
      )}

      <div className="cart-buttons">
        <button onClick={handleClearCart} className="boton-secundario">
          {t.clear || "Vaciar carrito"}
        </button>
      </div>

      <div className="payment-form-section">
        {!clientSecret && <p>Cargando formulario de pago...</p>}

        {clientSecret && termsAccepted && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default PagoEmbedPage;
