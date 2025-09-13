// Fix: Implement the main Dashboard component.
import React, { useState, useMemo, useCallback } from 'react';
import type { Expense } from '../types';
import { Summary } from './Summary';
import { ExpenseList } from './ExpenseList';
import { SpendingTrends } from './SpendingTrends';
import { AISummary } from './AISummary';
import { ExportData } from './ExportData';
import { generateInsights } from '../services/geminiService';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import { useDashboardSettings } from '../contexts/DashboardSettingsContext';
import { ExpenseFilter } from './ExpenseFilter';
import { AICoach } from './AICoach';

interface DashboardProps {
  expenses: Expense[];
  onRemoveExpense: (id: string) => void;
  onUpdateExpense: (expense: Expense) => void;
  onSplitExpense: (originalExpenseId: string, newItems: Omit<Expense, 'id' | 'date'>[]) => void;
}

type TimePeriod = 'all' | '7d' | '30d' | '90d';

export const Dashboard: React.FC<DashboardProps> = ({ expenses, onRemoveExpense, onUpdateExpense, onSplitExpense }) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [insights, setInsights] = useState<string | null>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const { currency } = useCurrency();
  const { accentColor } = useTheme();
  const { widgetVisibility } = useDashboardSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const filteredExpenses = useMemo(() => {
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let timeFilteredExpenses = sortedExpenses;
    if (timePeriod !== 'all') {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        
        const daysToSubtract = { '7d': 7, '30d': 30, '90d': 90 }[timePeriod];
        const cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - daysToSubtract);
        cutoffDate.setHours(0,0,0,0);

        timeFilteredExpenses = sortedExpenses.filter(expense => new Date(expense.date).getTime() >= cutoffDate.getTime());
    }

    return timeFilteredExpenses.filter(expense => {
      const searchMatch = searchTerm
        ? expense.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const categoryMatch = selectedCategories.length > 0
        ? selectedCategories.includes(expense.category)
        : true;
      return searchMatch && categoryMatch;
    });
  }, [expenses, timePeriod, searchTerm, selectedCategories]);
  
  const handleGenerateInsights = useCallback(async () => {
    if (filteredExpenses.length === 0) {
      setInsightsError("Not enough data to generate insights. Please add more expenses for the selected period.");
      return;
    }
    setIsInsightsLoading(true);
    setInsightsError(null);
    setInsights(null);
    try {
      const generatedInsights = await generateInsights(filteredExpenses, currency);
      setInsights(generatedInsights);
    } catch (e: any) {
      setInsightsError(e.message || 'An error occurred while generating insights.');
    } finally {
      setIsInsightsLoading(false);
    }
  }, [filteredExpenses, currency]);

  const handleCategorySelect = useCallback((category: string | null) => {
    if (category) {
      // If the category is already the only one selected, deselect it. Otherwise, select it.
      setSelectedCategories(prev => prev.length === 1 && prev[0] === category ? [] : [category]);
    } else {
      setSelectedCategories([]);
    }
  }, []);
  
  const timePeriodOptions: { value: TimePeriod, label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ];

  const filtersAreActive = searchTerm.length > 0 || selectedCategories.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-lg flex gap-1">
          {timePeriodOptions.map(option => (
             <button
              key={option.value}
              onClick={() => setTimePeriod(option.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                timePeriod === option.value
                  ? `${accentColor.bg} text-white`
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div id="dashboard-filter">
            <ExpenseFilter 
                searchTerm={searchTerm}
                selectedCategories={selectedCategories}
                onSearchTermChange={setSearchTerm}
                onSelectedCategoriesChange={setSelectedCategories}
              />
          </div>
          {widgetVisibility.aiCoach && <AICoach expenses={filteredExpenses} />}
          {widgetVisibility.aiSummary && (
            <div id="ai-insights">
              <AISummary insights={insights} isLoading={isInsightsLoading} error={insightsError} onGenerate={handleGenerateInsights} />
            </div>
          )}
          {widgetVisibility.spendingTrends && <SpendingTrends expenses={filteredExpenses} />}
          {widgetVisibility.expenseList && <ExpenseList 
            expenses={filteredExpenses} 
            onRemoveExpense={onRemoveExpense}
            onUpdateExpense={onUpdateExpense}
            onSplitExpense={onSplitExpense}
            filtersActive={filtersAreActive}
          />}
        </div>
        <div className="lg:col-span-1 space-y-8">
           {widgetVisibility.summary && <Summary expenses={filteredExpenses} onCategorySelect={handleCategorySelect} />}
           {widgetVisibility.exportData && <ExportData expenses={filteredExpenses} />}
        </div>
      </div>
    </div>
  );
};