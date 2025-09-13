import React, { useState, useRef, useEffect } from 'react';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { CogIcon } from './icons/CogIcon';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { useTheme } from '../contexts/ThemeContext';

interface ProfileDropdownProps {
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onOpenSettings, onOpenHelp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { accentColor } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${accentColor.focusRing}`}
      >
        <UserCircleIcon className="w-6 h-6 text-gray-800 dark:text-white" />
      </button>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-white">Guest User</p>
            <p className="truncate">guest@example.com</p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onOpenSettings(); setIsOpen(false); }}
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
          >
            <CogIcon className="w-5 h-5 mr-3" />
            Settings
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onOpenHelp(); setIsOpen(false); }}
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
          >
            <QuestionMarkCircleIcon className="w-5 h-5 mr-3" />
            Help
          </a>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); alert("Logout functionality not implemented."); setIsOpen(false); }}
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
          >
            <LogoutIcon className="w-5 h-5 mr-3" />
            Logout
          </a>
        </div>
      )}
    </div>
  );
};