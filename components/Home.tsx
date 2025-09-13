import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import type { Expense } from '../types';
import { CameraIcon } from './icons/CameraIcon';
import { CameraModal } from './CameraModal';
import { useCategories } from '../contexts/CategoryContext';
import { useTheme } from '../contexts/ThemeContext';
import { CropperModal } from './CropperModal';

interface HomeProps {
  onFileUpload: (file: File) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  isLoading: boolean;
  error: string | null;
}

const ADD_NEW_CATEGORY_VALUE = '__add_new__';

interface FormErrors {
  name?: string;
  price?: string;
  date?: string;
  newCategory?: string;
}

export const Home: React.FC<HomeProps> = ({ onFileUpload, onAddExpense, isLoading, error }) => {
  const { categories, addCategory } = useCategories();
  const { accentColor } = useTheme();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] || '');
  const [newCategory, setNewCategory] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    const finalCategory = category === ADD_NEW_CATEGORY_VALUE ? newCategory.trim() : category;

    if (!name.trim()) errors.name = 'Item name is required.';
    if (!date) errors.date = 'Please select a date.';

    if (category === ADD_NEW_CATEGORY_VALUE) {
      if (!newCategory.trim()) {
        errors.newCategory = 'New category name is required.';
      } else if (categories.includes(newCategory.trim())) {
        errors.newCategory = 'This category already exists.';
      }
    }
    
    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      errors.price = 'Please enter a valid, positive price.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    let finalCategory = category;
    if (category === ADD_NEW_CATEGORY_VALUE) {
      finalCategory = newCategory.trim();
      if (!categories.includes(finalCategory)) {
        addCategory(finalCategory);
      }
    }

    onAddExpense({
      name: name.trim(),
      category: finalCategory,
      price: parseFloat(price),
      date,
    });

    // Reset form
    setName('');
    setCategory(categories[0] || '');
    setNewCategory('');
    setPrice('');
    setDate(new Date().toISOString().split('T')[0]);
    setFormErrors({});
  };
  
  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };
  
  const handleCapture = (imageFile: File) => {
    setIsCameraOpen(false);
    handleFileSelected(imageFile);
  };

  const handleCropComplete = (croppedImageFile: File) => {
    setIsCropperOpen(false);
    setImageToCrop(null);
    onFileUpload(croppedImageFile);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Streamline Your Expense Tracking</h2>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Upload a receipt or add expenses manually. Let our AI do the heavy lifting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <FileUpload onFileSelect={handleFileSelected} isLoading={isLoading} error={error} />
           <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className={`w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 ${accentColor.focusRing} transition-colors`}
          >
            <CameraIcon className="w-5 h-5 mr-2" />
            Use Camera to Scan Receipt
          </button>
        </div>
        
        <div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Expense Manually</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-gray-100 dark:bg-gray-700 border text-gray-900 dark:text-white rounded-md shadow-sm ${accentColor.focusRing} ${accentColor.focusBorder} ${formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  placeholder="e.g., Coffee"
                />
                {formErrors.name && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.name}</p>}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md shadow-sm ${accentColor.focusRing} ${accentColor.focusBorder}`}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value={ADD_NEW_CATEGORY_VALUE}>Add New Category...</option>
                    </select>
                  </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full bg-gray-100 dark:bg-gray-700 border text-gray-900 dark:text-white rounded-md shadow-sm ${accentColor.focusRing} ${accentColor.focusBorder} ${formErrors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="0.00"
                    step="0.01"
                  />
                  {formErrors.price && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.price}</p>}
                </div>
              </div>
              
              {category === ADD_NEW_CATEGORY_VALUE && (
                <div>
                  <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Category Name</label>
                  <input
                    type="text"
                    id="newCategory"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className={`w-full bg-gray-100 dark:bg-gray-700 border text-gray-900 dark:text-white rounded-md shadow-sm ${accentColor.focusRing} ${accentColor.focusBorder} ${formErrors.newCategory ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="e.g., Subscriptions"
                  />
                  {formErrors.newCategory && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.newCategory}</p>}
                </div>
              )}


               <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full bg-gray-100 dark:bg-gray-700 border text-gray-900 dark:text-white rounded-md shadow-sm ${accentColor.focusRing} ${accentColor.focusBorder} ${formErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {formErrors.date && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.date}</p>}
              </div>


              <button
                type="submit"
                className={`w-full ${accentColor.bg} text-white font-bold py-2 px-4 rounded-md ${accentColor.hoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${accentColor.focusRing} transition-colors`}
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>
      </div>
       <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
      />
      {imageToCrop && (
        <CropperModal
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          onCrop={handleCropComplete}
          imageSrc={imageToCrop}
        />
      )}
    </div>
  );
};