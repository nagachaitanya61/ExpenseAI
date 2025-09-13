import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type Budgets = Record<string, number>;

interface BudgetContextType {
  budgets: Budgets;
  setBudget: (category: string, amount: number) => void;
  setAllBudgets: (newBudgets: Budgets) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [budgets, setBudgets] = useLocalStorage<Budgets>('expense_budgets', {});

  const setBudget = useCallback((category: string, amount: number) => {
    setBudgets(prev => ({
      ...prev,
      [category]: amount,
    }));
  }, [setBudgets]);
  
  const setAllBudgets = useCallback((newBudgets: Budgets) => {
    setBudgets(prev => ({
        ...prev,
        ...newBudgets
    }));
  }, [setBudgets]);

  const value = { budgets, setBudget, setAllBudgets };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
};
