import { useState, useCallback } from 'react';
import type { Expense, ExtractedItem } from '../types';
import { extractExpensesFromReceipt } from '../services/geminiService';
import { useLocalStorage } from './useLocalStorage';
import { useCategories } from '../contexts/CategoryContext';

export const useExpenses = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { categories } = useCategories();

  const processReceipt = useCallback(async (file: File): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const extractedData = await extractExpensesFromReceipt(file, categories);
      
      if (!extractedData || extractedData.length === 0) {
        throw new Error("No items could be extracted from the receipt. Please try a different image.");
      }
      
      const newExpenses: Expense[] = extractedData.map(item => ({
        ...item,
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0], // Add current date
      }));
      setExpenses(prevExpenses => [...prevExpenses, ...newExpenses]);
      return true;
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [categories, setExpenses]);

  const removeExpense = useCallback((id: string) => {
    setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
  }, [setExpenses]);
  
  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: crypto.randomUUID() };
    setExpenses(prev => [...prev, newExpense].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [setExpenses]);

  const addExpenseBatch = useCallback((newExpenses: Omit<Expense, 'id'>[]) => {
    const expensesToAdd = newExpenses.map(exp => ({ ...exp, id: crypto.randomUUID() }));
    setExpenses(prev => [...prev, ...expensesToAdd].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [setExpenses]);
  
  const updateExpense = useCallback((updatedExpense: Expense) => {
    setExpenses(prev => prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [setExpenses]);
  
  const splitExpense = useCallback((originalExpenseId: string, newItems: Omit<Expense, 'id' | 'date'>[]) => {
    setExpenses(prev => {
      const originalExpense = prev.find(e => e.id === originalExpenseId);
      if (!originalExpense) return prev;

      const splitGroupId = crypto.randomUUID();
      const splitExpenses: Expense[] = newItems.map(item => ({
        ...item,
        id: crypto.randomUUID(),
        date: originalExpense.date, // Keep original date
        splitGroupId,
      }));
      
      const otherExpenses = prev.filter(e => e.id !== originalExpenseId);
      return [...otherExpenses, ...splitExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }, [setExpenses]);

  return { expenses, processReceipt, removeExpense, addExpense, addExpenseBatch, updateExpense, splitExpense, isLoading, error };
};
