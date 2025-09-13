import { Currency } from './currencies';

export const formatCurrency = (amount: number, currency: Currency): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.code,
  }).format(amount);
};
