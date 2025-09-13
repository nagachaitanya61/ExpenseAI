import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { Dashboard } from './components/Dashboard';
import { BudgetingPage } from './components/BudgetingPage';
import { ReportsPage } from './components/ReportsPage';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { BudgetProvider, useBudgets } from './contexts/BudgetContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DashboardSettingsProvider } from './contexts/DashboardSettingsContext';
import { RecurringExpenseProvider } from './contexts/RecurringExpenseContext';
import { SavingsGoalProvider } from './contexts/SavingsGoalContext';
import { useExpenses } from './hooks/useExpenses';
import { useNotifications } from './hooks/useNotifications';
import { useRecurringExpenses } from './contexts/RecurringExpenseContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateDueExpenses } from './services/recurringExpenseService';
import type { Expense } from './types';
import { RecurringPage } from './components/RecurringPage';
import { GoalsPage } from './components/GoalsPage';
import { OnboardingGuide } from './components/OnboardingGuide';

export type Page = 'home' | 'dashboard' | 'budgeting' | 'reports' | 'recurring' | 'goals';

const AppContent: React.FC = () => {
  const { 
    expenses, 
    processReceipt, 
    removeExpense, 
    addExpense,
    addExpenseBatch,
    splitExpense,
    updateExpense,
    isLoading, 
    error 
  } = useExpenses();
  
  const { budgets } = useBudgets();
  const { notifications, unreadCount, markAllAsRead, clearAllNotifications } = useNotifications(expenses, budgets);
  const { recurringExpenses } = useRecurringExpenses();
  const [lastCheck, setLastCheck] = useLocalStorage('lastRecurringCheck', new Date(0).toISOString());

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage('onboardingComplete', false);

  useEffect(() => {
    const today = new Date();
    const lastCheckDate = new Date(lastCheck);
    
    // Check only once per day
    if (today.toDateString() !== lastCheckDate.toDateString()) {
      const { dueExpenses, updatedRecurringExpenses } = generateDueExpenses(recurringExpenses, lastCheckDate, today);
      if (dueExpenses.length > 0) {
        addExpenseBatch(dueExpenses);
        // This part would ideally update the source, but our hook structure is simple.
        // For this app, we'll assume `lastAddedDate` is handled inside the hook if needed.
        // Or we just rely on checking from the last check date each time.
      }
      setLastCheck(today.toISOString());
    }
  }, [recurringExpenses, lastCheck, setLastCheck, addExpenseBatch]);

  const handleFileUpload = useCallback(async (file: File) => {
    const success = await processReceipt(file);
    if (success) {
      setCurrentPage('dashboard');
    }
  }, [processReceipt]);

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    addExpense(expense);
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard expenses={expenses} onRemoveExpense={removeExpense} onUpdateExpense={updateExpense} onSplitExpense={splitExpense} />;
      case 'budgeting':
        return <BudgetingPage expenses={expenses} />;
      case 'reports':
        return <ReportsPage expenses={expenses} />;
      case 'recurring':
        return <RecurringPage />;
      case 'goals':
        return <GoalsPage expenses={expenses} />;
      case 'home':
      default:
        return <Home onFileUpload={handleFileUpload} onAddExpense={handleAddExpense} isLoading={isLoading} error={error} />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
      <Header 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onOpenSettings={() => setIsSettingsModalOpen(true)} 
        onOpenHelp={() => setIsHelpModalOpen(true)}
        notifications={notifications}
        unreadNotificationCount={unreadCount}
        onMarkAllNotificationsRead={markAllAsRead}
        onClearAllNotifications={clearAllNotifications}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      {!hasCompletedOnboarding && <OnboardingGuide onComplete={() => setHasCompletedOnboarding(true)} />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <CategoryProvider>
          <BudgetProvider>
            <RecurringExpenseProvider>
              <SavingsGoalProvider>
                <DashboardSettingsProvider>
                  <AppContent />
                </DashboardSettingsProvider>
              </SavingsGoalProvider>
            </RecurringExpenseProvider>
          </BudgetProvider>
        </CategoryProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;