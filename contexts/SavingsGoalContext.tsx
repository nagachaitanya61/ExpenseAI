import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { SavingsGoal } from '../types';

interface SavingsGoalContextType {
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (goal: SavingsGoal) => void;
  removeGoal: (id: string) => void;
}

const SavingsGoalContext = createContext<SavingsGoalContextType | undefined>(undefined);

export const SavingsGoalProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [goals, setGoals] = useLocalStorage<SavingsGoal[]>('savings_goals', []);

  const addGoal = useCallback((goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = { ...goal, id: crypto.randomUUID() };
    setGoals(prev => [...prev, newGoal]);
  }, [setGoals]);

  const updateGoal = useCallback((updatedGoal: SavingsGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  }, [setGoals]);

  const removeGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, [setGoals]);

  const value = { goals, addGoal, updateGoal, removeGoal };

  return (
    <SavingsGoalContext.Provider value={value}>
      {children}
    </SavingsGoalContext.Provider>
  );
};

export const useSavingsGoals = () => {
  const context = useContext(SavingsGoalContext);
  if (context === undefined) {
    throw new Error('useSavingsGoals must be used within a SavingsGoalProvider');
  }
  return context;
};
