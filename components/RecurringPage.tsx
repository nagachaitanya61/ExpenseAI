import React, { useState } from 'react';
import { useRecurringExpenses } from '../contexts/RecurringExpenseContext';
import { useCategories } from '../contexts/CategoryContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import type { RecurringExpense } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { RepeatIcon } from './icons/RepeatIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ConfirmationModal } from './ConfirmationModal';
import { categoryImages } from '../utils/categoryVisuals';

const RecurringExpenseForm: React.FC<{ expense?: RecurringExpense, onSave: () => void }> = ({ expense, onSave }) => {
    const { addRecurringExpense, updateRecurringExpense } = useRecurringExpenses();
    const { categories } = useCategories();
    const { currency } = useCurrency();
    const { accentColor } = useTheme();

    const [name, setName] = useState(expense?.name || '');
    const [price, setPrice] = useState(expense?.price.toString() || '');
    const [category, setCategory] = useState(expense?.category || categories[0]);
    const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>(expense?.frequency || 'monthly');
    const [startDate, setStartDate] = useState(expense?.startDate || new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const priceNum = parseFloat(price);
        if (!name || isNaN(priceNum) || priceNum <= 0) {
            // Basic validation
            alert("Please fill out all fields with valid values.");
            return;
        }

        const recurringData = { name, price: priceNum, category, frequency, startDate };
        if (expense) {
            updateRecurringExpense({ ...recurringData, id: expense.id, lastAddedDate: expense.lastAddedDate });
        } else {
            addRecurringExpense(recurringData);
        }
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{expense ? 'Edit' : 'Add'} Recurring Expense</h3>
            <div>
                <label htmlFor="rec-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input id="rec-name" type="text" value={name} onChange={e => setName(e.target.value)} required className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white ${accentColor.focusRing} ${accentColor.focusBorder}`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="rec-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ({currency.symbol})</label>
                    <input id="rec-price" type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0.01" step="0.01" className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white ${accentColor.focusRing} ${accentColor.focusBorder}`} />
                </div>
                 <div>
                    <label htmlFor="rec-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select id="rec-category" value={category} onChange={e => setCategory(e.target.value)} className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white ${accentColor.focusRing} ${accentColor.focusBorder}`}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="rec-frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                    <select id="rec-frequency" value={frequency} onChange={e => setFrequency(e.target.value as any)} className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white ${accentColor.focusRing} ${accentColor.focusBorder}`}>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="rec-startdate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                    <input id="rec-startdate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white ${accentColor.focusRing} ${accentColor.focusBorder}`} />
                </div>
            </div>
            <div className="flex justify-end pt-2">
                 <button type="submit" className={`bg-accent-600 text-white font-bold py-2 px-4 rounded-md hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${accentColor.focusRing} transition-colors`}>
                    Save Expense
                </button>
            </div>
        </form>
    )
}


export const RecurringPage: React.FC = () => {
  const { recurringExpenses, removeRecurringExpense } = useRecurringExpenses();
  const { currency } = useCurrency();
  const { accentColor } = useTheme();
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (deletingExpenseId) {
        removeRecurringExpense(deletingExpenseId);
        setDeletingExpenseId(null);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <RepeatIcon className={`w-12 h-12 ${accentColor.text} mx-auto mb-4`} />
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Recurring Expenses</h2>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Manage your fixed, repeating expenses like subscriptions and bills. The app will automatically add them on their due date.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
             <RecurringExpenseForm key={editingExpense?.id || 'new'} expense={editingExpense || undefined} onSave={() => setEditingExpense(null)} />
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Recurring Expenses</h3>
            {recurringExpenses.length > 0 ? (
                <div className="space-y-4">
                    {recurringExpenses.map(exp => (
                        <div key={exp.id} className="bg-gray-100/50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <img src={categoryImages[exp.category]} alt={exp.category} className="w-10 h-10 rounded-lg object-cover" />
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{exp.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{exp.frequency} &bull; Starts {new Date(exp.startDate + 'T00:00:00').toLocaleDateString()}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4">
                                <p className={`font-semibold ${accentColor.text} text-right`}>{formatCurrency(exp.price, currency)}</p>
                                <div className="flex gap-1">
                                    <button onClick={() => setEditingExpense(exp)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setDeletingExpenseId(exp.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">You have no recurring expenses yet.</p>
            )}
        </div>
      </div>
      {deletingExpenseId && (
        <ConfirmationModal
          isOpen={!!deletingExpenseId}
          onClose={() => setDeletingExpenseId(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Recurring Expense"
          message="Are you sure you want to delete this recurring expense? This will stop it from being automatically added in the future."
        />
      )}
    </div>
  );
};