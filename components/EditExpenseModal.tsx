import React, { useState, useEffect } from 'react';
import type { Expense } from '../types';
import { useCategories } from '../contexts/CategoryContext';
import { useTheme } from '../contexts/ThemeContext';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  expense: Expense;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({ isOpen, onClose, onSave, expense }) => {
  const [name, setName] = useState(expense.name);
  const [category, setCategory] = useState(expense.category);
  const [price, setPrice] = useState(expense.price.toString());
  const [date, setDate] = useState(expense.date);
  const { categories } = useCategories();
  const { accentColor } = useTheme();
  
  useEffect(() => {
    setName(expense.name);
    setCategory(expense.category);
    setPrice(expense.price.toString());
    setDate(expense.date);
  }, [expense]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNumber = parseFloat(price);
    if (name.trim() && !isNaN(priceNumber) && priceNumber > 0 && date) {
      onSave({
        ...expense,
        name: name.trim(),
        category,
        price: priceNumber,
        date,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Expense</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name</label>
            <input
              type="text"
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm ${accentColor.focusRing} ${accentColor.focusBorder}`}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  id="edit-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm ${accentColor.focusRing} ${accentColor.focusBorder}`}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            <div>
              <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
              <input
                type="number"
                id="edit-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm ${accentColor.focusRing} ${accentColor.focusBorder}`}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
          </div>

           <div>
            <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input
              type="date"
              id="edit-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm ${accentColor.focusRing} ${accentColor.focusBorder}`}
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`bg-accent-600 text-white font-bold py-2 px-4 rounded-md hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500 transition-colors`}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};