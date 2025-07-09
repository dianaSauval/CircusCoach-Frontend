import { createContext, useContext, useState, useEffect } from "react";
import { getActiveDiscounts } from "../services/discountService";

const DiscountContext = createContext();

export const DiscountProvider = ({ children }) => {
  const [activeDiscount, setActiveDiscount] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveDiscount = async () => {
    try {
      const res = await getActiveDiscounts();
      setActiveDiscount(res); // res debería tener { name, percentage, expiresAt }
    } catch (err) {
      console.error("No se pudo obtener el descuento activo:", err);
      setActiveDiscount(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDiscount();
  }, []);

  return (
    <DiscountContext.Provider value={{ activeDiscount, loading, refreshDiscount: fetchActiveDiscount }}>
      {children}
    </DiscountContext.Provider>
  );
};

export const useDiscount = () => useContext(DiscountContext);
