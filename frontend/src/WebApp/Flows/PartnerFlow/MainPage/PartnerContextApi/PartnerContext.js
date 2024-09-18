import React, { createContext, useState, useContext } from 'react';

const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [selectedMenu, setSelectedMenu] = useState('');

  return (
    <PartnerContext.Provider value={{ selectedMenu, setSelectedMenu }}>
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartnerContext = () => useContext(PartnerContext);
