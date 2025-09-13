import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { useTheme } from '../contexts/ThemeContext';

interface AISummaryProps {
  insights: string | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
}

export const AISummary: React.FC<AISummaryProps> = ({ insights, isLoading, error, onGenerate }) => {
  const { accentColor } = useTheme();

  const formatInsights = (text: string) => {
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, `<strong class="${accentColor.text}">$1</strong>`)
      .replace(/\n/g, '<br />');
    return <p dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <SparklesIcon className={`w-6 h-6 ${accentColor.text}`} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI-Powered Insights</h2>
        </div>
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className={`bg-accent-600 text-white font-bold py-2 px-4 rounded-md hover:bg-accent-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500 transition-colors flex items-center`}
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="w-5 h-5 mr-2" />
              Generating...
            </>
          ) : (
            'Generate Insights'
          )}
        </button>
      </div>
      
      <div className="bg-gray-100/50 dark:bg-gray-700/50 p-4 rounded-lg min-h-[120px] flex items-center justify-center">
        {isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>Our AI is analyzing your spending...</p>
          </div>
        ) : error ? (
          <p className="text-red-500 dark:text-red-400 text-center">{error}</p>
        ) : insights ? (
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {formatInsights(insights)}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Click "Generate Insights" to get a summary of your spending patterns for the selected period.
          </p>
        )}
      </div>
    </div>
  );
};