import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import { categoryImages } from '../utils/categoryVisuals';

interface CategoryComparisonData {
  category: string;
  current: number;
  comparison: number;
}

interface CategoryComparisonTableProps {
  data: CategoryComparisonData[];
  currentLabel: string;
  comparisonLabel: string;
}

const getDifferenceColor = (difference: number) => {
  if (difference > 0) return 'text-red-500 dark:text-red-400';
  if (difference < 0) return 'text-green-500 dark:text-green-400';
  return 'text-gray-500 dark:text-gray-400';
};

export const CategoryComparisonTable: React.FC<CategoryComparisonTableProps> = ({ data, currentLabel, comparisonLabel }) => {
  const { currency } = useCurrency();

  if (data.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 p-4">
        Not enough data for a detailed category comparison.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Category</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">{currentLabel}</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">{comparisonLabel}</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Change</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-800">
          {data.map(({ category, current, comparison }) => {
            const difference = current - comparison;
            const percentageChange = comparison > 0 ? (difference / comparison) * 100 : (current > 0 ? 100 : 0);
            return (
              <tr key={category}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                  <div className="flex items-center gap-3">
                    <img src={categoryImages[category]} alt={category} className="w-8 h-8 rounded-lg object-cover" />
                    <span>{category}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">{formatCurrency(current, currency)}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">{formatCurrency(comparison, currency)}</td>
                <td className={`whitespace-nowrap px-3 py-4 text-sm font-semibold ${getDifferenceColor(difference)}`}>
                  <div>{difference >= 0 ? '+' : ''}{formatCurrency(difference, currency)}</div>
                  <div className="text-xs font-normal">({percentageChange.toFixed(1)}%)</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};