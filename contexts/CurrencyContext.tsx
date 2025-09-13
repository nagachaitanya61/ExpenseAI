import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Currency, currencies } from '../utils/currencies';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(currencies[0]); // Default to USD

  const value = { currency, setCurrency };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
