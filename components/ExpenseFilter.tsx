import React, { useState, useEffect } from 'react';
import { useCategories } from '../contexts/CategoryContext';
import { SearchIcon } from './icons/SearchIcon';
import { FilterIcon } from './icons/FilterIcon';
import { useTheme } from '../contexts/ThemeContext';

interface ExpenseFilterProps {
  searchTerm: string;
  selectedCategories: string[];
  onSearchTermChange: (term: string) => void;
  onSelectedCategoriesChange: (categories: string[]) => void;
}

export const ExpenseFilter: React.FC<ExpenseFilterProps> = ({ 
  searchTerm, 
  selectedCategories, 
  onSearchTermChange, 
  onSelectedCategoriesChange 
}) => {
  const { categories } = useCategories();
  const { accentColor } = useTheme();
  const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchTermChange(internalSearchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [internalSearchTerm, onSearchTermChange]);
  
  // Sync internal search with external changes (e.g., clearing filters)
  useEffect(() => {
    setInternalSearchTerm(searchTerm);
  }, [searchTerm]);

  const toggleCategory = (category: string) => {
    onSelectedCategoriesChange(
      selectedCategories.includes(category)
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories, category]
    );
  };

  const clearFilters = () => {
    onSearchTermChange('');
    onSelectedCategoriesChange([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-grow w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by expense name..."
            value={internalSearchTerm}
            onChange={(e) => setInternalSearchTerm(e.target.value)}
            className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm pl-10 ${accentColor.focusRing} ${accentColor.focusBorder}`}
          />
        </div>
        {/* Clear Filters Button */}
        {(searchTerm || selectedCategories.length > 0) && (
          <button
            onClick={clearFilters}
            className={`text-sm font-medium ${accentColor.text} hover:opacity-80 px-3 py-1 whitespace-nowrap bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md`}
          >
            Clear Filters
          </button>
        )}
      </div>
      
      {/* Category Filters */}
      <div>
         <div className="flex items-center gap-2 mb-3">
            <FilterIcon className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">Filter by Category</h3>
         </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                selectedCategories.includes(category)
                  ? `${accentColor.bg} text-white shadow-md`
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};