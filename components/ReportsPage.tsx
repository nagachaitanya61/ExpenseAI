import React, { useMemo, useState } from 'react';
import type { Expense } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ComparisonChart } from './ComparisonChart';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import { CategoryComparisonTable } from './CategoryComparisonTable';
import { useTheme } from '../contexts/ThemeContext';

interface ReportsPageProps {
  expenses: Expense[];
}

type ComparisonPeriod = 'last_month' | 'last_7_days' | 'last_30_days';

const calculateTotalForPeriod = (expenses: Expense[], startDate: Date, endDate: Date): number => {
  return expenses
    .filter(e => {
      const expenseDate = new Date(e.date + 'T00:00:00');
      return expenseDate >= startDate && expenseDate <= endDate;
    })
    .reduce((sum, e) => sum + e.price, 0);
};

const calculateCategoryTotalsForPeriod = (expenses: Expense[], startDate: Date, endDate: Date): Record<string, number> => {
  const totals: Record<string, number> = {};
  expenses
    .filter(e => {
      const expenseDate = new Date(e.date + 'T00:00:00');
      return expenseDate >= startDate && expenseDate <= endDate;
    })
    .forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.price;
    });
  return totals;
};

export const ReportsPage: React.FC<ReportsPageProps> = ({ expenses }) => {
  const { currency } = useCurrency();
  const { accentColor } = useTheme();
  const [comparison, setComparison] = useState<ComparisonPeriod>('last_month');

  const { 
    currentTotal, 
    comparisonTotal, 
    currentLabel, 
    comparisonLabel, 
    difference, 
    percentageChange,
    categoryComparisonData
  } = useMemo(() => {
    const now = new Date();
    let currentStartDate: Date, currentEndDate: Date, comparisonStartDate: Date, comparisonEndDate: Date;
    let currentLabel: string;
    let comparisonLabel: string;

    currentEndDate = new Date(now);
    currentEndDate.setHours(23, 59, 59, 999);

    if (comparison === 'last_month') {
      currentStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
      currentLabel = `This Month (${currentStartDate.toLocaleString('default', { month: 'long' })})`;
      comparisonEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
      comparisonStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      comparisonLabel = `Last Month (${comparisonStartDate.toLocaleString('default', { month: 'long' })})`;
    } else if (comparison === 'last_7_days') {
      currentStartDate = new Date(now);
      currentStartDate.setDate(now.getDate() - 6);
      currentStartDate.setHours(0, 0, 0, 0);
      currentLabel = 'Last 7 Days';
      comparisonEndDate = new Date(currentStartDate);
      comparisonEndDate.setDate(currentStartDate.getDate() - 1);
      comparisonEndDate.setHours(23, 59, 59, 999);
      comparisonStartDate = new Date(comparisonEndDate);
      comparisonStartDate.setDate(comparisonEndDate.getDate() - 6);
      comparisonStartDate.setHours(0, 0, 0, 0);
      comparisonLabel = 'Previous 7 Days';
    } else { // last_30_days
      currentStartDate = new Date(now);
      currentStartDate.setDate(now.getDate() - 29);
      currentStartDate.setHours(0, 0, 0, 0);
      currentLabel = 'Last 30 Days';
      comparisonEndDate = new Date(currentStartDate);
      comparisonEndDate.setDate(currentStartDate.getDate() - 1);
      comparisonEndDate.setHours(23, 59, 59, 999);
      comparisonStartDate = new Date(comparisonEndDate);
      comparisonStartDate.setDate(comparisonEndDate.getDate() - 29);
      comparisonStartDate.setHours(0, 0, 0, 0);
      comparisonLabel = 'Previous 30 Days';
    }

    const currentTotal = calculateTotalForPeriod(expenses, currentStartDate, currentEndDate);
    const comparisonTotal = calculateTotalForPeriod(expenses, comparisonStartDate, comparisonEndDate);
    
    const difference = currentTotal - comparisonTotal;
    const percentageChange = comparisonTotal > 0 ? (difference / comparisonTotal) * 100 : (currentTotal > 0 ? 100 : 0);

    const currentCategoryTotals = calculateCategoryTotalsForPeriod(expenses, currentStartDate, currentEndDate);
    const comparisonCategoryTotals = calculateCategoryTotalsForPeriod(expenses, comparisonStartDate, comparisonEndDate);
    
    const allCategories = new Set([...Object.keys(currentCategoryTotals), ...Object.keys(comparisonCategoryTotals)]);
    
    const categoryComparisonData = Array.from(allCategories)
      .map(category => ({
        category,
        current: currentCategoryTotals[category] || 0,
        comparison: comparisonCategoryTotals[category] || 0,
      }))
      .sort((a, b) => (b.current + b.comparison) - (a.current + a.comparison));

    return { currentTotal, comparisonTotal, currentLabel, comparisonLabel, difference, percentageChange, categoryComparisonData };
  }, [expenses, comparison]);

  const comparisonOptions: { value: ComparisonPeriod, label: string }[] = [
    { value: 'last_month', label: 'vs. Last Month' },
    { value: 'last_7_days', label: 'vs. Previous 7 Days' },
    { value: 'last_30_days', label: 'vs. Previous 30 Days' },
  ];

  const getDifferenceColor = () => {
    if (difference > 0) return 'text-red-500 dark:text-red-400';
    if (difference < 0) return 'text-green-500 dark:text-green-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Comparisons</h1>
        <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-lg flex gap-1">
          {comparisonOptions.map(option => (
             <button
              key={option.value}
              onClick={() => setComparison(option.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                comparison === option.value
                  ? `${accentColor.bg} text-white`
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <ChartBarIcon className={`w-6 h-6 text-gray-500 dark:text-gray-400`} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Overall Spending Comparison</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
            <div className="bg-gray-100/50 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentLabel}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(currentTotal, currency)}</p>
            </div>
            <div className="bg-gray-100/50 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">{comparisonLabel}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(comparisonTotal, currency)}</p>
            </div>
            <div className="bg-gray-100/50 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Difference</p>
                <p className={`text-2xl font-bold ${getDifferenceColor()}`}>
                  {difference >= 0 ? '+' : ''}{formatCurrency(difference, currency)}
                  <span className={`text-sm font-normal ml-2 ${getDifferenceColor()}`}>
                    ({percentageChange.toFixed(1)}%)
                  </span>
                </p>
            </div>
        </div>

        <ComparisonChart 
            data={{ currentTotal, comparisonTotal, currentLabel, comparisonLabel }} 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
           <ChartBarIcon className={`w-6 h-6 text-gray-500 dark:text-gray-400`} />
           <h2 className="text-xl font-bold text-gray-900 dark:text-white">Category Breakdown</h2>
        </div>
        <CategoryComparisonTable 
          data={categoryComparisonData}
          currentLabel={currentLabel}
          comparisonLabel={comparisonLabel}
        />
      </div>
    </div>
  );
};