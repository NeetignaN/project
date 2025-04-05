import React, { createContext, useContext, useState } from "react";

const VendorDataContext = createContext();

export function useVendorData() {
  const context = useContext(VendorDataContext);
  if (!context) {
    throw new Error("useVendorData must be used within a VendorDataProvider");
  }
  return context;
}

export function VendorDataProvider({ children }) {
  // State for storing data from API
  const [products, setProducts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [designers, setDesigners] = useState([]); // For tracking which designers use vendor's products

  // Values to provide through the context
  const value = {
    // Data states
    products,
    setProducts,
    conversations,
    setConversations,
    schedules,
    setSchedules,
    designers,
    setDesigners,
  };

  return (
    <VendorDataContext.Provider value={value}>
      {children}
    </VendorDataContext.Provider>
  );
}
