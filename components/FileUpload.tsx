import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { useTheme } from '../contexts/ThemeContext';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { accentColor } = useTheme();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upload Receipt</h2>
      <label 
        htmlFor="file-upload" 
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isLoading ? 'border-gray-400 dark:border-gray-600' : `border-gray-300 dark:border-gray-500 hover:${accentColor.border} dark:hover:${accentColor.border} hover:bg-gray-100/50 dark:hover:bg-gray-700/50`}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isLoading ? (
          <div className="text-center">
            <SpinnerIcon className={`w-12 h-12 ${accentColor.text}`} />
            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Analyzing Receipt...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">This may take a moment.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500">PNG, JPG or WEBP</p>
          </div>
        )}
        <input ref={fileInputRef} id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} disabled={isLoading} />
      </label>
      {error && <p className="mt-4 text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}
    </div>
  );
};