import React, { useState, useCallback, useMemo } from 'react';
import { useSavingsGoals } from '../contexts/SavingsGoalContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useBudgets } from '../contexts/BudgetContext';
import { useTheme } from '../contexts/ThemeContext';
import { generateCoachingMessage } from '../services/geminiService';
import type { Expense } from '../types';
import { TargetIcon } from './icons/TargetIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface AICoachProps {
  expenses: Expense[];
}

export const AICoach: React.FC<AICoachProps> = ({ expenses }) => {
  const { goals } = useSavingsGoals();
  const { currency } = useCurrency();
  const { budgets } = useBudgets();
  const { accentColor } = useTheme();

  const [tip, setTip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primaryGoal = useMemo(() => {
    if (goals.length === 0) return null;
    // Simple logic: return the one with the nearest deadline
    return [...goals].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];
  }, [goals]);

  const handleGetTip = useCallback(async () => {
    if (!primaryGoal) return;
    setIsLoading(true);
    setError(null);
    setTip(null);
    try {
      const message = await generateCoachingMessage(primaryGoal, expenses, budgets, currency);
      setTip(message);
    } catch (e: any) {
      setError(e.message || "Could not get a tip at this time.");
    } finally {
      setIsLoading(false);
    }
  }, [primaryGoal, expenses, budgets, currency]);
  
  const formatTip = (text: string) => {
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, `<strong class="${accentColor.text}">$1</strong>`)
      .replace(/\n/g, '<br />');
    return <p dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  if (!primaryGoal) {
    return null; // Don't show the component if there are no goals
  }
  
  const progress = (primaryGoal.savedAmount / primaryGoal.targetAmount) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <TargetIcon className={`w-6 h-6 ${accentColor.text}`} />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Savings Coach</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your progress towards: <span className="font-semibold">{primaryGoal.name}</span></p>
          </div>
        </div>
        <button
          onClick={handleGetTip}
          disabled={isLoading}
          className={`bg-accent-600 text-white font-bold py-2 px-4 rounded-md hover:bg-accent-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500 transition-colors flex items-center text-sm sm:text-base`}
        >
          {isLoading ? <SpinnerIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
          {isLoading ? 'Thinking...' : 'Get a Tip'}
        </button>
      </div>

       <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <div className={`${accentColor.bg} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
        </div>
      
      <div className="bg-gray-100/50 dark:bg-gray-700/50 p-4 rounded-lg min-h-[90px] flex items-center justify-center">
        {isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>Your coach is thinking of the perfect tip...</p>
          </div>
        ) : error ? (
          <p className="text-red-500 dark:text-red-400 text-center">{error}</p>
        ) : tip ? (
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {formatTip(tip)}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Click "Get a Tip" for personalized advice on reaching your goal!
          </p>
        )}
      </div>
    </div>
  );
};