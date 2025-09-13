import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { currencies } from '../utils/currencies';
import { useTheme } from '../contexts/ThemeContext';

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  const { accentColor } = useTheme();

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = currencies.find(c => c.code === event.target.value);
    if (selectedCurrency) {
      setCurrency(selectedCurrency);
    }
  };

  return (
    <select
      value={currency.code}
      onChange={handleCurrencyChange}
      className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm ${accentColor.focusRing} ${accentColor.focusBorder} transition`}
    >
      {currencies.map(c => (
        <option key={c.code} value={c.code}>
          {c.code} - {c.name}
        </option>
      ))}
    </select>
  );
};