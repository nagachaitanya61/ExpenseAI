import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Help Center</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-3xl">&times;</button>
        </div>
        
        <div className="space-y-4 text-gray-700 dark:text-gray-300 prose prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300">
          <h4>How to Use ExpenseAI</h4>
          <p>
            This application helps you track your expenses by automatically extracting items from receipt images using AI.
          </p>
          <ol>
            <li><strong>Upload a Receipt:</strong> On the Home page, click the upload area or drag and drop a clear image of your receipt.</li>
            <li><strong>AI Analysis:</strong> Our AI will process the image to identify each item, its category, and price. This may take a few moments.</li>
            <li><strong>Manual Entry:</strong> You can also add expenses manually using the form on the Home page.</li>
            <li><strong>View Dashboard:</strong> Navigate to the Dashboard to see a list of all your expenses and a summary of your spending by category.</li>
          </ol>
           <h4>Tips for Best Results</h4>
           <ul>
                <li>Use clear, well-lit photos of your receipts.</li>
                <li>Ensure the entire receipt is visible and not crumpled.</li>
                <li>The AI works best with standard printed receipts.</li>
           </ul>
        </div>

        <div className="mt-8 text-right">
          <button
            onClick={onClose}
            className={`bg-accent-600 text-white font-bold py-2 px-4 rounded-md hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500 transition-colors`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};