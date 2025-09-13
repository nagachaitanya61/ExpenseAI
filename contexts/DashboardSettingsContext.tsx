import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface WidgetVisibility {
  aiSummary: boolean;
  spendingTrends: boolean;
  expenseList: boolean;
  summary: boolean;
  exportData: boolean;
  aiCoach: boolean;
}

interface DashboardSettingsContextType {
  widgetVisibility: WidgetVisibility;
  setWidgetVisibility: React.Dispatch<React.SetStateAction<WidgetVisibility>>;
  toggleWidgetVisibility: (widget: keyof WidgetVisibility) => void;
}

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined);

const defaultVisibility: WidgetVisibility = {
  aiSummary: true,
  spendingTrends: true,
  expenseList: true,
  summary: true,
  exportData: true,
  aiCoach: true,
};

export const DashboardSettingsProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [widgetVisibility, setWidgetVisibility] = useLocalStorage<WidgetVisibility>('dashboard_widgets', defaultVisibility);

  const toggleWidgetVisibility = useCallback((widget: keyof WidgetVisibility) => {
    setWidgetVisibility(prev => ({
      ...prev,
      [widget]: !prev[widget]
    }));
  }, [setWidgetVisibility]);

  const value = { widgetVisibility, setWidgetVisibility, toggleWidgetVisibility };

  return (
    <DashboardSettingsContext.Provider value={value}>
      {children}
    </DashboardSettingsContext.Provider>
  );
};

export const useDashboardSettings = () => {
  const context = useContext(DashboardSettingsContext);
  if (context === undefined) {
    throw new Error('useDashboardSettings must be used within a DashboardSettingsProvider');
  }
  return context;
};
