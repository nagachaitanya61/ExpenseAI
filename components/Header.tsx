import React, { useState } from 'react';
import { ReceiptIcon } from './icons/ReceiptIcon';
import { ProfileDropdown } from './ProfileDropdown';
import type { Page } from '../App';
import type { Notification } from '../types';
import { MenuIcon } from './icons/MenuIcon';
import { CloseIcon } from './icons/CloseIcon';
import { BellIcon } from './icons/BellIcon';
import { NotificationPanel } from './NotificationPanel';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  notifications: Notification[];
  unreadNotificationCount: number;
  onMarkAllNotificationsRead: () => void;
  onClearAllNotifications: () => void;
}

const navItems: { id: Page; name: string }[] = [
  { id: 'home', name: 'Home' },
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'recurring', name: 'Recurring' },
  { id: 'budgeting', name: 'Budgets' },
  { id: 'goals', name: 'Goals' },
  { id: 'reports', name: 'Reports' },
];

export const Header: React.FC<HeaderProps> = ({ 
  currentPage, 
  onNavigate, 
  onOpenSettings, 
  onOpenHelp,
  notifications,
  unreadNotificationCount,
  onMarkAllNotificationsRead,
  onClearAllNotifications
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const { accentColor } = useTheme();

  const handleNotificationToggle = () => {
    setIsNotificationPanelOpen(prev => !prev);
    if (!isNotificationPanelOpen) { // If we are opening it
      onMarkAllNotificationsRead();
    }
  };

  const NavLink: React.FC<{ page: Page, name: string, isMobile?: boolean }> = ({ page, name, isMobile = false }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
      }}
      className={isMobile ? 
        `block w-full text-left rounded-md px-3 py-2 text-base font-medium ${ currentPage === page ? `bg-gray-900 text-white` : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`
        :
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        currentPage === page
          ? `${accentColor.bg} text-white`
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-700/50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {name}
    </button>
  );

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button onClick={() => onNavigate('home')} className="flex-shrink-0 flex items-center gap-2 text-gray-900 dark:text-white">
              <ReceiptIcon className={`h-8 w-8 ${accentColor.text}`} />
              <span className="font-bold text-xl">ExpenseAI</span>
            </button>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map(item => (
                  <NavLink key={item.id} page={item.id} name={item.name} />
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 gap-4">
              <div className="relative">
                <button
                  onClick={handleNotificationToggle}
                  className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" />
                  {unreadNotificationCount > 0 && (
                    <span className={`absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ${accentColor.bg} ring-2 ring-white dark:ring-gray-800`}></span>
                  )}
                </button>
                <NotificationPanel 
                  isOpen={isNotificationPanelOpen}
                  onClose={() => setIsNotificationPanelOpen(false)}
                  notifications={notifications}
                  onClearAll={onClearAllNotifications}
                  onMarkAllRead={onMarkAllNotificationsRead}
                />
              </div>
              <div id="profile-dropdown">
                <ProfileDropdown onOpenSettings={onOpenSettings} onOpenHelp={onOpenHelp} />
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-white dark:bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent-500"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <CloseIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
              <NavLink key={item.id} page={item.id} name={item.name} isMobile />
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
             <div className="px-2 space-y-1">
                <button
                    onClick={() => { onOpenSettings(); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                >
                    Settings
                </button>
                 <button
                    onClick={() => { onOpenHelp(); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                >
                    Help
                </button>
             </div>
          </div>
        </div>
      )}
    </header>
  );
};