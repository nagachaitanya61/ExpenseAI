// Fix: Implement the ExpenseList component to display and manage expenses.
import React, { useState } from 'react';
import type { Expense } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import { categoryImages } from '../utils/categoryVisuals';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { SplitIcon } from './icons/SplitIcon';
import { EditExpenseModal } from './EditExpenseModal';
import { ConfirmationModal } from './ConfirmationModal';
import { SplitExpenseModal } from './SplitExpenseModal';
import { useTheme } from '../contexts/ThemeContext';


interface ExpenseListProps {
  expenses: Expense[];
  onRemoveExpense: (id: string) => void;
  onUpdateExpense: (expense: Expense) => void;
  onSplitExpense: (originalExpenseId: string, newItems: Omit<Expense, 'id' | 'date'>[]) => void;
  filtersActive: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onRemoveExpense, onUpdateExpense, onSplitExpense, filtersActive }) => {
  const { currency } = useCurrency();
  const { accentColor } = useTheme();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [splittingExpense, setSplittingExpense] = useState<Expense | null>(null);

  const handleSaveEdit = (updatedExpense: Expense) => {
    onUpdateExpense(updatedExpense);
    setEditingExpense(null);
  };
  
  const handleConfirmDelete = () => {
    if (deletingExpenseId) {
      onRemoveExpense(deletingExpenseId);
      setDeletingExpenseId(null);
    }
  };

  const handleSaveSplit = (originalExpenseId: string, newItems: Omit<Expense, 'id' | 'date'>[]) => {
    onSplitExpense(originalExpenseId, newItems);
    setSplittingExpense(null);
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {filtersActive ? "No Expenses Match Your Filters" : "No Expenses Yet"}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {filtersActive ? "Try adjusting your search or category filters." : "Upload a receipt or add an expense manually to get started."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">All Expenses</h2>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="bg-gray-100/50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 flex-grow">
                 <img
                  src={categoryImages[expense.category]}
                  alt={expense.category}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-gray-900 dark:text-white">{expense.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{expense.category} &bull; {new Date(expense.date + 'T00:00:00').toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className={`font-semibold ${accentColor.text} text-right min-w-[80px]`}>{formatCurrency(expense.price, currency)}</p>
                <div className="flex gap-1">
                    <button onClick={() => setSplittingExpense(expense)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label={`Split ${expense.name}`}>
                        <SplitIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setEditingExpense(expense)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label={`Edit ${expense.name}`}>
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setDeletingExpenseId(expense.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" aria-label={`Delete ${expense.name}`}>
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {editingExpense && (
        <EditExpenseModal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          onSave={handleSaveEdit}
          expense={editingExpense}
        />
      )}

      {splittingExpense && (
        <SplitExpenseModal
          isOpen={!!splittingExpense}
          onClose={() => setSplittingExpense(null)}
          onSplit={handleSaveSplit}
          expense={splittingExpense}
        />
      )}
      
      {deletingExpenseId && (
        <ConfirmationModal
          isOpen={!!deletingExpenseId}
          onClose={() => setDeletingExpenseId(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Expense"
          message="Are you sure you want to delete this expense? This action cannot be undone."
        />
      )}
    </>
  );
};