'use client';
import React, { createContext, useContext, useState } from 'react';

interface CurrencyContextType {
  currency: string;
  currencyCode: string;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState('$');
  const [currencyCode] = useState('USD');

  return (
    <CurrencyContext.Provider value={{ currency, currencyCode, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    return { currency: '$', currencyCode: 'USD', setCurrency: () => {} };
  }
  return context;
};