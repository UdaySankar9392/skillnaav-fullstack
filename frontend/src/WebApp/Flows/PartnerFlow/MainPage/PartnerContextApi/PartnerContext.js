import React, { createContext, useState, useContext } from "react";

const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  // Initialize selectedMenu with 'your-job-posts' to render it by default
  const [selectedMenu, setSelectedMenu] = useState("your-job-posts");

  return (
    <PartnerContext.Provider value={{ selectedMenu, setSelectedMenu }}>
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartnerContext = () => useContext(PartnerContext);
