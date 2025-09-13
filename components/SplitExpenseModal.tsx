import React, { useState, useEffect } from 'react';
import type { Expense } from '../types';
import { useCategories } from '../contexts/CategoryContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/formatCurrency';
import { TrashIcon } from './icons/TrashIcon';

type SplitItem = {
    id: string;
    name: string;
    category: string;
    price: string;
};

interface SplitExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSplit: (originalExpenseId: string, newItems: Omit<Expense, 'id' | 'date'>[]) => void;
  expense: Expense;
}

export const SplitExpenseModal: React.FC<SplitExpenseModalProps> = ({ isOpen, onClose, onSplit, expense }) => {
  const { categories } = useCategories();
  const { currency } = useCurrency();
  const { accentColor } = useTheme();

  const [items, setItems] = useState<SplitItem[]>([
    { id: crypto.randomUUID(), name: expense.name, category: expense.category, price: expense.price.toString() },
    { id: crypto.randomUUID(), name: '', category: categories[0], price: '0.00' },
  ]);

  const totalSplit = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const remaining = expense.price - totalSplit;

  const handleItemChange = (id: string, field: keyof Omit<SplitItem, 'id'>, value: string) => {
    setItems(currentItems => currentItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  
  const addItem = () => {
    setItems(currentItems => [...currentItems, { id: crypto.randomUUID(), name: '', category: categories[0], price: '0.00' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
        setItems(currentItems => currentItems.filter(item => item.id !== id));
    }
  };

  const handleSplit = () => {
    if (Math.abs(remaining) > 0.001) {
        alert(`The total of split items must equal the original price. You have ${formatCurrency(remaining, currency)} remaining.`);
        return;
    }
    const newItems = items
        .filter(item => item.name.trim() !== '' && parseFloat(item.price) > 0)
        .map(item => ({
            name: item.name,
            category: item.category,
            price: parseFloat(item.price)
        }));

    if (newItems.length > 0) {
        onSplit(expense.id, newItems);
    } else {
        alert("Please create at least one valid split item.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Split Expense</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl">&times;</button>
        </div>
        
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Original Expense</p>
                <p className="font-semibold text-gray-900 dark:text-white">{expense.name}</p>
            </div>
            <p className={`text-lg font-bold ${accentColor.text}`}>{formatCurrency(expense.price, currency)}</p>
        </div>
        
        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
            {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <input type="text" placeholder="Item Name" value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} className={`col-span-4 w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white ${accentColor.focusRing} ${accentColor.focusBorder}`} />
                    <select value={item.category} onChange={e => handleItemChange(item.id, 'category', e.target.value)} className={`col-span-4 w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white ${accentColor.focusRing} ${accentColor.focusBorder}`}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                     <input type="number" placeholder="0.00" value={item.price} onChange={e => handleItemChange(item.id, 'price', e.target.value)} step="0.01" className={`col-span-3 w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white ${accentColor.focusRing} ${accentColor.focusBorder}`} />
                    <button onClick={() => removeItem(item.id)} disabled={items.length <= 1} className="col-span-1 p-2 text-gray-500 hover:text-red-500 disabled:opacity-50 disabled:hover:text-gray-500 transition-colors">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
            ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
            <button onClick={addItem} className={`text-sm font-medium ${accentColor.text} hover:opacity-80`}>+ Add Item</button>
            <div className="text-right">
                <p className={`font-semibold ${remaining === 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(remaining, currency)} Remaining
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total: {formatCurrency(totalSplit, currency)}</p>
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={handleSplit} className={`bg-accent-600 text-white font-bold py-2 px-4 rounded-md hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${accentColor.focusRing} transition-colors`}>
            Confirm Split
          </button>
        </div>
      </div>
    </div>
  );
};