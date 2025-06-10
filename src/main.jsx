import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
     
    <LanguageProvider>
      <AuthProvider>
       <CartProvider>
      {" "}
      <App />
      </CartProvider>
      </AuthProvider>
    </LanguageProvider>
    
  </StrictMode>
);
