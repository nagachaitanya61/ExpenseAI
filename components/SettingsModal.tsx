import React from 'react';
import { CurrencySelector } from './CurrencySelector';
import { useTheme } from '../contexts/ThemeContext';
import { useDashboardSettings } from '../contexts/DashboardSettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeSelector: React.FC = () => {
  const { theme, setTheme, accent, setAccent } = useTheme();

  return (
    <div className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Appearance
        </label>
         <div className="flex gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
            <button onClick={() => setTheme('light')} className={`w-full py-2 text-sm rounded-md transition-colors ${theme === 'light' ? 'bg-white shadow' : 'hover:bg-white/50'}`}>Light</button>
            <button onClick={() => setTheme('dark')} className={`w-full py-2 text-sm rounded-md transition-colors ${theme === 'dark' ? 'bg-gray-900 text-white shadow' : 'text-gray-900 dark:text-white dark:hover:bg-gray-900/50'}`}>Dark</button>
         </div>
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Accent Color
        </label>
         <div className="flex gap-4">
            <button onClick={() => setAccent('cyan')} className={`w-8 h-8 rounded-full bg-cyan-500 ${accent === 'cyan' ? 'ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800 ring-cyan-500' : ''}`}></button>
            <button onClick={() => setAccent('indigo')} className={`w-8 h-8 rounded-full bg-indigo-500 ${accent === 'indigo' ? 'ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800 ring-indigo-500' : ''}`}></button>
            <button onClick={() => setAccent('pink')} className={`w-8 h-8 rounded-full bg-pink-500 ${accent === 'pink' ? 'ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800 ring-pink-500' : ''}`}></button>
         </div>
      </div>
    </div>
  );
};

const DashboardWidgetSettings: React.FC = () => {
  const { widgetVisibility, toggleWidgetVisibility } = useDashboardSettings();

  type WidgetKey = keyof typeof widgetVisibility;

  const widgetLabels: Record<WidgetKey, string> = {
    aiSummary: "AI Insights",
    spendingTrends: "Spending Trends",
    expenseList: "Expense List",
    summary: "Summary Panel",
    exportData: "Export Data Panel",
    aiCoach: "AI Savings Coach"
  };

  return (
     <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dashboard Widgets
        </label>
        <div className="space-y-2">
            {Object.keys(widgetVisibility).map((key) => (
                <label key={key} className="flex items-center justify-between">
                    <span className="text-gray-800 dark:text-gray-200">{widgetLabels[key as WidgetKey]}</span>
                     <button
                        role="switch"
                        aria-checked={widgetVisibility[key as WidgetKey]}
                        onClick={() => toggleWidgetVisibility(key as WidgetKey)}
                        className={`${widgetVisibility[key as WidgetKey] ? 'bg-accent-600' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2`}
                    >
                        <span
                            aria-hidden="true"
                            className={`${widgetVisibility[key as WidgetKey] ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                        />
                    </button>
                </label>
            ))}
        </div>
     </div>
  );
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-white text-3xl">&times;</button>
        </div>
        
        <div className="space-y-6">
          <ThemeSelector />
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency
            </label>
            <CurrencySelector />
          </div>
           <div className="border-t border-gray-200 dark:border-gray-700"></div>
           <DashboardWidgetSettings />
        </div>

        <div className="mt-8 text-right">
          <button
            onClick={onClose}
            className={`bg-accent-600 text-white font-bold py-2 px-4 rounded-md hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500 transition-colors`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};