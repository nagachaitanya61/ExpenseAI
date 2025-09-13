import React, { useMemo, useState, useEffect } from 'react';
import type { Expense } from '../types';
import { useCategories } from '../contexts/CategoryContext';
import { useBudgets } from '../contexts/BudgetContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import { categoryImages } from '../utils/categoryVisuals';
import { WalletIcon } from './icons/WalletIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { generateBudgetSuggestions } from '../services/geminiService';
import { useTheme } from '../contexts/ThemeContext';


interface BudgetingPageProps {
  expenses: Expense[];
}

const getBudgetStatusColor = (percentage: number) => {
  if (percentage > 100) return 'bg-red-500'; // Over budget
  if (percentage > 85) return 'bg-yellow-500'; // Nearing budget
  return 'bg-green-500'; // On track
};

interface BudgetCardProps {
  category: string;
  spent: number;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ category, spent }) => {
  const { budgets, setBudget } = useBudgets();
  const { currency } = useCurrency();
  const { accentColor } = useTheme();
  const budget = budgets[category] || 0;
  
  const [inputValue, setInputValue] = useState(budget > 0 ? budget.toString() : '');

  // Sync input value when budget prop from context changes (e.g., from AI suggestion)
  useEffect(() => {
    setInputValue(budget > 0 ? budget.toString() : '');
  }, [budget]);
  
  // Debounced effect for saving user-edited budget
  useEffect(() => {
    const handler = setTimeout(() => {
      const amount = parseFloat(inputValue);
      const newBudget = !isNaN(amount) && amount >= 0 ? amount : 0;
      if (newBudget !== budget) {
          setBudget(category, newBudget);
      }
    }, 750); // 750ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, category, setBudget, budget]);

  const remaining = budget - spent;
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <img
            src={categoryImages[category]}
            alt={`${category} icon`}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{category}</h3>
        </div>
        
        <div>
          <label htmlFor={`budget-${category}`} className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Set Monthly Budget</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
               <span className="text-gray-500 dark:text-gray-400 sm:text-sm">{currency.symbol}</span>
            </div>
            <input
                type="number"
                id={`budget-${category}`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm pl-7 ${accentColor.focusRing} ${accentColor.focusBorder}`}
                placeholder="0.00"
                min="0"
                step="1"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-baseline mb-1 text-sm">
          <span className="text-gray-700 dark:text-gray-300">Spent: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(spent, currency)}</span></span>
          {budget > 0 && <span className="text-gray-500 dark:text-gray-400">of {formatCurrency(budget, currency)}</span>}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          {budget > 0 && (
            <div 
              className={`${getBudgetStatusColor(percentage)} h-2.5 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(percentage, 100)}%` }}>
            </div>
          )}
        </div>
        <div className="text-right mt-2 text-sm">
          {budget > 0 ? (
            remaining >= 0 ? (
              <p className="text-green-500 dark:text-green-400">{formatCurrency(remaining, currency)} remaining</p>
            ) : (
              <p className="text-red-500 dark:text-red-400">{formatCurrency(Math.abs(remaining), currency)} over budget</p>
            )
          ) : (
            <p className="text-gray-500">No budget set</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const BudgetingPage: React.FC<BudgetingPageProps> = ({ expenses }) => {
  const { categories } = useCategories();
  const { setAllBudgets } = useBudgets();
  const { currency } = useCurrency();
  const { accentColor } = useTheme();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const spentByCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    categories.forEach(cat => categoryMap[cat] = 0); // Initialize all categories
    
    expenses.forEach(expense => {
      // Only consider expenses from the current month
      const expenseDate = new Date(expense.date);
      const today = new Date();
      if (expenseDate.getFullYear() === today.getFullYear() && expenseDate.getMonth() === today.getMonth()) {
          if (categoryMap.hasOwnProperty(expense.category)) {
              categoryMap[expense.category] += expense.price;
          }
      }
    });
    return categoryMap;
  }, [expenses, categories]);

  const handleSuggestBudgets = async () => {
    setIsSuggesting(true);
    setSuggestionError(null);
    try {
      const now = new Date();
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(now.getDate() - 90);

      const recentExpenses = expenses.filter(e => new Date(e.date) >= ninetyDaysAgo);
      
      if (recentExpenses.length < 5) {
        throw new Error("You need at least 5 expenses in the last 90 days for an accurate suggestion.");
      }

      const suggestions = await generateBudgetSuggestions(recentExpenses, categories, currency);
      setAllBudgets(suggestions);

    } catch (e: any) {
      setSuggestionError(e.message || "An unexpected error occurred.");
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <WalletIcon className={`w-12 h-12 ${accentColor.text} mx-auto mb-4`} />
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Monthly Budget Planner</h2>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Set spending limits for each category for the current month. Or, let our AI suggest a plan based on your recent spending.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={handleSuggestBudgets}
          disabled={isSuggesting}
          className={`bg-accent-600 text-white font-bold py-2 px-6 rounded-md hover:bg-accent-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 focus:ring-accent-500 transition-colors flex items-center justify-center`}
        >
          {isSuggesting ? (
            <>
              <SpinnerIcon className="w-5 h-5 mr-2" />
              Thinking...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Get AI Budget Suggestions
            </>
          )}
        </button>
      </div>
      {suggestionError && (
        <div className="text-center bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-lg max-w-2xl mx-auto">
          <p>{suggestionError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <BudgetCard 
            key={category}
            category={category}
            spent={spentByCategory[category] || 0}
          />
        ))}
      </div>
    </div>
  );
};