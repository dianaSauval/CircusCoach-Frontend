// src/pages/PagoEmbedPage.jsx
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
import "../styles/pages/PagoEmbedPage.css";
import { FaTrash } from "react-icons/fa";
import { Helmet } from "react-helmet";
import { formatPrice } from "../utils/formatPrice";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { pickLangWithSpanishFallback } from "../utils/pickLang";

// ✅ NUEVO util
import {
  getCartItemTitle,
  getCartItemImage,
  getCartItemId,
} from "../utils/cartItemView";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PagoEmbedPage = () => {
  const [clientSecret, setClientSecret] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const { cart, cartCount, setCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const t = translations.cart?.[language] || translations.cart?.es || {};

  const CURRENCY = "EUR";
  const localeMap = { es: "es-ES", en: "en-GB", fr: "fr-FR" };
  const lang = localeMap[language] || "es-ES";

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
        const itemsParaPago = cart.map((item) => ({
          id: getCartItemId(item),
          type: item.type,
          price: calcularPrecioConDescuento(item),
          title: getCartItemTitle(item, language), // ✅ SIEMPRE string
        }));

        const res = await crearPaymentIntent({
          items: itemsParaPago,
          language,
        });

        setClientSecret(res.clientSecret);
      } catch (err) {
        console.error("Error al obtener clientSecret", err);
      }
    };

    // ✅ Solo creamos payment intent si está logueado (porque si no, no puede pagar)
    if (cart.length > 0 && isAuthenticated) {
      obtenerClientSecret();
    } else {
      setClientSecret(null);
    }
  }, [cart, language, isAuthenticated]);

  const handleRemoveItem = (indexToRemove) => {
    const newCart = cart.filter((_, index) => index !== indexToRemove);
    setCart(newCart);
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const appearance = { theme: "stripe" };
  const options = { clientSecret, appearance, locale: language || "es" };

  const handleOpenTermsInline = () => {
    setTimeout(() => {
      const el = document.getElementById("terms-box");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  if (cartCount === 0) {
    return (
      <div className="empty-wrapper-carrito">
        <EmptyState title={t.emptyTitle} subtitle={t.emptySubtitle} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="cart-page-container">
        <h1>{t.title}</h1>

        <ul className="cart-list">
          {cart.map((item, index) => {
            const title = getCartItemTitle(item, language);
            const image = getCartItemImage(item, language);

            return (
              <li key={index} className="cart-item">
                <img
                  src={image}
                  alt={title || "Producto"}
                  className="cart-item-img"
                />

                <div className="cart-item-info">
                  <h3 className="titulo-principal">{title}</h3>

                  {item.discount ? (
                    <div className="precio-con-descuento">
                      <span className="precio-final">
                        {formatPrice(
                          calcularPrecioConDescuento(item),
                          CURRENCY,
                          lang
                        )}
                      </span>
                      <span className="precio-original">
                        {formatPrice(item.price, CURRENCY, lang)}
                      </span>
                      <span className="nombre-descuento">
                        🎁{" "}
                        {pickLangWithSpanishFallback(
                          item.discount?.name,
                          language
                        )}{" "}
                        - {item.discount.percentage}%{" "}
                        {t.off ||
                          (language === "en"
                            ? "OFF"
                            : language === "fr"
                            ? "DE RÉDUCTION"
                            : "OFF")}
                      </span>
                    </div>
                  ) : (
                    <p className="precio-normal">
                      {formatPrice(item.price, CURRENCY, lang)}
                    </p>
                  )}

                  <button
                    className="boton-eliminar small"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <FaTrash /> {t.remove || "Eliminar"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="cart-summary">
          <p className="label-formulario">{t.total}:</p>
          <p className="texto">{formatPrice(totalPrice, CURRENCY, lang)}</p>
        </div>

        {/* ✅ Si NO está logueado: mostramos solo el aviso + CTAs */}
        {!isAuthenticated ? (
          <EmptyState
            title={t.loginRequiredTitle}
            subtitle={t.loginRequiredText}
          >
            <Link to="/login" className="boton-ghost">
              {t.loginCta}
            </Link>
            <Link to="/register" className="boton-secundario">
              {t.registerCta}
            </Link>
          </EmptyState>
        ) : (
          <>
            {/* ✅ Si está logueado: recién acá se ven términos y pago */}
            <TermsCheckbox
              checkedTerms={termsAccepted}
              onChangeTerms={(e) => setTermsAccepted(e.target.checked)}
              checkedPrivacy={privacyAccepted}
              onChangePrivacy={(e) => setPrivacyAccepted(e.target.checked)}
              language={language}
              onOpenTermsModal={handleOpenTermsInline}
              termsUrl="/terminos"
              privacyUrl="/privacidad"
            />

            {(!termsAccepted || !privacyAccepted) && (
              <p style={{ color: "red", marginTop: "0.5rem" }}>
                {t.acceptTermsWarning ||
                  "Debes aceptar los términos y la privacidad para continuar."}
              </p>
            )}

            <div className="cart-buttons">
              <button onClick={handleClearCart} className="boton-secundario">
                {t.clear || "Vaciar carrito"}
              </button>
            </div>

            <div className="payment-form-section">
              {!clientSecret && (
                <p>{t.loadingPayment || "Cargando formulario de pago..."}</p>
              )}

              {clientSecret && termsAccepted && privacyAccepted && (
                <Elements options={options} stripe={stripePromise}>
                  <CheckoutForm />
                </Elements>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PagoEmbedPage;
