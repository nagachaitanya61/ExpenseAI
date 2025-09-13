import React from 'react';
import type { Expense } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { useTheme } from '../contexts/ThemeContext';

interface ExportDataProps {
  expenses: Expense[];
}

export const ExportData: React.FC<ExportDataProps> = ({ expenses }) => {
  const { accentColor } = useTheme();

  const handleExport = (format: 'csv' | 'json') => {
    if (expenses.length === 0) {
      alert("There is no data to export for the selected period.");
      return;
    }
    
    try {
      // Per requirement, temporarily store in localStorage
      localStorage.setItem('temp_export_data', JSON.stringify(expenses));
      const dataString = localStorage.getItem('temp_export_data');
      
      if (!dataString) {
        throw new Error("Could not retrieve data from storage for export.");
      }

      const dataToExport: Expense[] = JSON.parse(dataString);
      
      let fileContent: string;
      let fileType: string;
      let fileName: string;
      
      if (format === 'csv') {
        const headers = Object.keys(dataToExport[0]);
        // Using JSON.stringify on each value handles commas and quotes within fields
        const csvRows = [
          headers.join(','),
          ...dataToExport.map(row => 
            headers.map(fieldName => {
              const value = row[fieldName as keyof Expense];
              return JSON.stringify(value);
            }).join(',')
          )
        ];
        fileContent = csvRows.join('\r\n');
        fileType = 'text/csv;charset=utf-8;';
        fileName = 'expenses.csv';
      } else { // json
        fileContent = JSON.stringify(dataToExport, null, 2);
        fileType = 'application/json;charset=utf-8;';
        fileName = 'expenses.json';
      }

      const blob = new Blob([fileContent], { type: fileType });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
      alert("An error occurred during export. Please try again.");
    } finally {
      // Clean up localStorage after operation
      localStorage.removeItem('temp_export_data');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <DownloadIcon className={`w-6 h-6 text-gray-500 dark:text-gray-400`} />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Data</h2>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Download your currently filtered expense data in your preferred format.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => handleExport('csv')}
          className="flex-1 justify-center items-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500 transition-colors inline-flex"
        >
          Export as CSV
        </button>
        <button
          onClick={() => handleExport('json')}
          className={`flex-1 justify-center items-center bg-accent-600 text-white font-bold py-2 px-4 rounded-md hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500 transition-colors inline-flex`}
        >
          Export as JSON
        </button>
      </div>
    </div>
  );
};