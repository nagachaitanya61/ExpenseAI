import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Expense } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { useBudgets } from '../contexts/BudgetContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/formatCurrency';
import { categoryImages, categoryColors, getCategoryColor } from '../utils/categoryVisuals';

interface SummaryProps {
  expenses: Expense[];
  onCategorySelect: (category: string | null) => void;
}

const getBudgetStatusColor = (percentage: number) => {
  if (percentage > 100) return 'bg-red-500'; // Over budget
  if (percentage > 85) return 'bg-yellow-500'; // Nearing budget
  return 'bg-green-500'; // On track
};

export const Summary: React.FC<SummaryProps> = ({ expenses, onCategorySelect }) => {
  const { currency } = useCurrency();
  const { budgets } = useBudgets();
  const { theme, accentColor } = useTheme();

  const total = useMemo(() => expenses.reduce((sum, expense) => sum + expense.price, 0), [expenses]);

  const byCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    expenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += expense.price;
    });
    return Object.entries(categoryMap).sort(([, a], [, b]) => b - a);
  }, [expenses]);
  
  const pieChartData = useMemo(() => byCategory.map(([name, value]) => ({ name, value })), [byCategory]);
  
  const tooltipStyle = theme === 'dark' 
    ? { backgroundColor: 'rgba(3, 7, 18, 0.8)', borderColor: '#374151' } // bg-gray-950/80, border-gray-700
    : { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: '#d1d5db' }; // bg-white/80, border-gray-300
    
  const legendStyle = theme === 'dark' ? { color: '#d1d5db' } : { color: '#374151' };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-6 sticky top-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Summary</h2>
        <div className="bg-gray-100/50 dark:bg-gray-700/50 p-4 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Total Expenses</p>
          <p className={`text-3xl font-bold ${accentColor.text}`}>{formatCurrency(total, currency)}</p>
        </div>
      </div>

      {pieChartData.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 text-center">Spending Breakdown</h3>
           <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  onClick={(data) => onCategorySelect(data.name)}
                  style={{cursor: 'pointer'}}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    ...tooltipStyle,
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value: number) => [formatCurrency(value, currency), 'Amount']}
                />
                <Legend onClick={(data) => onCategorySelect(data.value)} wrapperStyle={{...legendStyle, cursor: 'pointer', fontSize: '14px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">By Category</h3>
        <div className="space-y-4">
          {byCategory.map(([category, amount]) => {
            const budget = budgets[category];
            const budgetPercentage = budget && budget > 0 ? (amount / budget) * 100 : null;

            return (
              <div key={category}>
                <div className="flex justify-between items-center mb-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-3">
                    <img
                      src={categoryImages[category] || categoryImages['Other']}
                      alt={`${category} icon`}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <span className="font-medium">{category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{formatCurrency(amount, currency)}</span>
                    {budget && <p className="text-xs text-gray-500 dark:text-gray-400">of {formatCurrency(budget, currency)}</p>}
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  {/* Fix: Use the imported 'categoryColors' proxy which correctly maps category names to Tailwind color classes. */}
                  <div 
                    className={`${budget ? getBudgetStatusColor(budgetPercentage!) : categoryColors[category]} h-2.5 rounded-full`}
                    style={{ width: budgetPercentage ? `${Math.min(budgetPercentage, 100)}%` : `${(amount / total) * 100}%` }}>
                  </div>
                </div>
                {budgetPercentage && budgetPercentage > 100 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1 text-right">
                    You are {formatCurrency(amount - budget!, currency)} over budget!
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};