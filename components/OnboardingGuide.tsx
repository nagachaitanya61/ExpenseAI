import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface OnboardingGuideProps {
    onComplete: () => void;
}

const steps = [
    {
        selector: '#file-upload',
        title: 'Scan Receipts with AI',
        content: 'Click here or drag a receipt image to automatically extract all expenses. It\'s magic!',
        position: 'bottom',
    },
    {
        selector: 'nav',
        title: 'Navigate Your Finances',
        content: 'Use these tabs to switch between the Dashboard, manage Recurring expenses, set Budgets, create Goals, and view Reports.',
        position: 'bottom',
    },
    {
        selector: '#dashboard-filter',
        title: 'Filter & Search',
        content: 'On the dashboard, you can quickly search for expenses or filter by category to analyze your spending.',
        position: 'bottom',
    },
    {
        selector: '#ai-insights',
        title: 'Get AI Insights',
        content: 'Click here to let our AI analyze your spending for the selected period and give you helpful insights.',
        position: 'top',
    },
     {
        selector: '#profile-dropdown',
        title: 'Customize Your Experience',
        content: 'Click the profile icon to open Settings, where you can change the theme, currency, and more.',
        position: 'bottom',
    },
];

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const { accentColor } = useTheme();

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };
    
    useEffect(() => {
        const step = steps[currentStep];
        // Give the DOM a moment to update, especially on page changes
        const timer = setTimeout(() => {
            const element = document.querySelector(step.selector);
            if (element) {
                setTargetRect(element.getBoundingClientRect());
            } else {
                 // If element not found, maybe it's on another page. For this app, we'll just skip.
                 handleNext();
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [currentStep]);
    
    
    if (!targetRect) {
        return null;
    }
    
    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/70" onClick={onComplete}></div>
            
            {/* Highlighted Area */}
            <div className="absolute transition-all duration-300" style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
                borderRadius: '8px',
            }}></div>
            
            {/* Tooltip */}
            <div className={`absolute w-72 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl text-gray-900 dark:text-white transform transition-all duration-300
                ${step.position === 'bottom' ? 'top-full mt-4' : ''}
                ${step.position === 'top' ? 'bottom-full mb-4' : ''}
            `} style={{
                top: step.position === 'bottom' ? targetRect.bottom + 8 : 'auto',
                left: targetRect.left + targetRect.width / 2 - 144, // 144 is half of tooltip width
                bottom: step.position === 'top' ? (window.innerHeight - targetRect.top) + 8 : 'auto',
            }}>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{step.content}</p>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-gray-500">{currentStep + 1} / {steps.length}</span>
                    <div>
                         <button onClick={onComplete} className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-4">Skip</button>
                        <button onClick={handleNext} className={`px-4 py-2 text-sm rounded-md text-white font-semibold ${accentColor.bg} ${accentColor.hoverBg}`}>
                            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
                 <div className={`absolute w-3 h-3 bg-white dark:bg-gray-800 transform rotate-45
                    ${step.position === 'bottom' ? '-top-1.5' : ''}
                    ${step.position === 'top' ? '-bottom-1.5' : ''}
                 `} style={{left: '50%', marginLeft: '-6px'}}></div>
            </div>
        </div>
    );
};