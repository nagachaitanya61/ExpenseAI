// Fix: Implement the CategoryReviewModal component.
import React, { useState, useEffect } from 'react';
import type { ExtractedItem } from '../types';
import { useCategories } from '../contexts/CategoryContext';
import { useTheme } from '../contexts/ThemeContext';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';

interface CategoryReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reviewedItems: ExtractedItem[]) => void;
  items: ExtractedItem[];
}

export const CategoryReviewModal: React.FC<CategoryReviewModalProps> = ({ isOpen, onClose, onConfirm, items }) => {
  const [reviewedItems, setReviewedItems] = useState<ExtractedItem[]>(items);
  const { categories } = useCategories();
  const { accentColor } = useTheme();

  useEffect(() => {
    setReviewedItems(items);
  }, [items]);

  if (!isOpen) return null;

  const handleCategoryChange = (index: number, newCategory: string) => {
    const updatedItems = [...reviewedItems];
    updatedItems[index].category = newCategory;
    setReviewedItems(updatedItems);
  };
  
  const handleConfirm = () => {
    onConfirm(reviewedItems);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Extracted Items</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl">&times;</button>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/50 p-4 rounded-lg flex items-center gap-3 mb-4">
            <ExclamationCircleIcon className="w-6 h-6 text-yellow-500 dark:text-amber-400 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Please review the categories assigned by the AI. You can make corrections before adding them to your expenses.
            </p>
        </div>
        
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
          {reviewedItems.map((item, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 items-center">
              <p className="col-span-1 text-gray-900 dark:text-white truncate">{item.name}</p>
              <p className={`col-span-1 text-gray-700 dark:text-gray-300 font-semibold text-right`}>{item.price.toFixed(2)}</p>
              <div className="col-span-1">
                 <select
                  value={item.category}
                  onChange={(e) => handleCategoryChange(index, e.target.value)}
                  className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm ${accentColor.focusRing} ${accentColor.focusBorder} text-sm`}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  {!categories.includes(item.category) && <option value={item.category}>{item.category} (Suggested)</option>}
                </select>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`bg-accent-600 text-white font-bold py-2 px-4 rounded-md hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500 transition-colors`}
            >
              Confirm and Add Expenses
            </button>
          </div>
      </div>
    </div>
  );
};