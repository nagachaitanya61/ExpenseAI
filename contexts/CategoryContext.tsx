import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const DEFAULT_CATEGORIES = ['Food', 'Groceries', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Other'];

interface CategoryContextType {
  categories: string[];
  addCategory: (category: string) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [categories, setCategories] = useLocalStorage<string[]>('expense_categories', DEFAULT_CATEGORIES);

  const addCategory = useCallback((category: string) => {
    const trimmedCategory = category.trim();
    if (trimmedCategory && !categories.includes(trimmedCategory)) {
      setCategories(prev => [...prev, trimmedCategory]);
    }
  }, [categories, setCategories]);

  const value = { categories, addCategory };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};