import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { RecurringExpense } from '../types';

interface RecurringExpenseContextType {
  recurringExpenses: RecurringExpense[];
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id'|'lastAddedDate'>) => void;
  updateRecurringExpense: (expense: RecurringExpense) => void;
  removeRecurringExpense: (id: string) => void;
}

const RecurringExpenseContext = createContext<RecurringExpenseContextType | undefined>(undefined);

export const RecurringExpenseProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [recurringExpenses, setRecurringExpenses] = useLocalStorage<RecurringExpense[]>('recurring_expenses', []);

  const addRecurringExpense = useCallback((expense: Omit<RecurringExpense, 'id'|'lastAddedDate'>) => {
    const newExpense: RecurringExpense = { 
        ...expense, 
        id: crypto.randomUUID(),
        // Set last added to day before start date so it's picked up on first check
        lastAddedDate: new Date(new Date(expense.startDate).getTime() - 86400000).toISOString().split('T')[0]
    };
    setRecurringExpenses(prev => [...prev, newExpense]);
  }, [setRecurringExpenses]);

  const updateRecurringExpense = useCallback((updatedExpense: RecurringExpense) => {
    setRecurringExpenses(prev => prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
  }, [setRecurringExpenses]);

  const removeRecurringExpense = useCallback((id: string) => {
    setRecurringExpenses(prev => prev.filter(exp => exp.id !== id));
  }, [setRecurringExpenses]);

  const value = { recurringExpenses, addRecurringExpense, updateRecurringExpense, removeRecurringExpense };

  return (
    <RecurringExpenseContext.Provider value={value}>
      {children}
    </RecurringExpenseContext.Provider>
  );
};

export const useRecurringExpenses = () => {
  const context = useContext(RecurringExpenseContext);
  if (context === undefined) {
    throw new Error('useRecurringExpenses must be used within a RecurringExpenseProvider');
  }
  return context;
};
