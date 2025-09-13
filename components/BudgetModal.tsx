import React, { useState } from 'react';
import { useCategories } from '../contexts/CategoryContext';
import { useBudgets } from '../contexts/BudgetContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose }) => {
  const { categories } = useCategories();
  const { budgets, setBudget } = useBudgets();
  const { currency } = useCurrency();
  const [currentBudgets, setCurrentBudgets] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    categories.forEach(cat => {
      obj[cat] = budgets[cat]?.toString() || '';
    });
    return obj;
  });

  if (!isOpen) return null;
  
  const handleBudgetChange = (category: string, value: string) => {
    setCurrentBudgets(prev => ({
      ...prev,
      [category]: value
    }));
  };
  
  const handleSave = () => {
    Object.entries(currentBudgets).forEach(([category, amountStr]) => {
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount >= 0) {
            setBudget(category, amount);
        } else {
            // If input is empty or invalid, treat it as removing the budget
            setBudget(category, 0); 
        }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Manage Monthly Budgets</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <p className="text-sm text-gray-400">
                Set a monthly spending limit for each category. Leave the field empty or set to 0 to remove a budget.
            </p>
            {categories.map(category => (
                <div key={category}>
                    <label htmlFor={`budget-${category}`} className="block text-sm font-medium text-gray-300 mb-1">{category}</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                           <span className="text-gray-400 sm:text-sm">{currency.symbol}</span>
                        </div>
                        <input
                            type="number"
                            id={`budget-${category}`}
                            value={currentBudgets[category] || ''}
                            onChange={(e) => handleBudgetChange(category, e.target.value)}
                            className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 pl-7"
                            placeholder="0.00"
                            min="0"
                            step="1"
                        />
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
                onClick={handleSave}
                className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors"
            >
                Save Budgets
            </button>
        </div>
      </div>
    </div>
  );
};