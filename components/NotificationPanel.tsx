import React, { useRef, useEffect, useState } from 'react';
import type { Notification } from '../types';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { BellIcon } from './icons/BellIcon';
import { ConfirmationModal } from './ConfirmationModal';
import { useTheme } from '../contexts/ThemeContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

const formatDistanceToNow = (isoDate: string) => {
    const date = new Date(isoDate);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
};

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    switch (type) {
        case 'budget_critical':
            return <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full"><ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" /></div>;
        case 'budget_warning':
            return <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-full"><ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" /></div>;
        case 'reminder':
            return <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full"><InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>;
        default:
            return <BellIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, notifications, onMarkAllRead, onClearAll }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const { accentColor } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);
  
  const handleConfirmClear = () => {
    onClearAll();
    setIsClearConfirmOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={panelRef}
        className="origin-top-right absolute right-0 mt-2 w-80 max-w-sm rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div key={notification.id} className={`p-4 flex items-start gap-4 border-b border-gray-200/50 dark:border-gray-700/50 ${!notification.read ? 'bg-gray-50 dark:bg-gray-900/40' : ''}`}>
                <NotificationIcon type={notification.type} />
                <div className="flex-grow">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDistanceToNow(notification.timestamp)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8">
              <BellIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">You're all caught up!</p>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
           <div className="p-2 bg-gray-100 dark:bg-gray-900/50 flex justify-between">
              <button 
                  onClick={onMarkAllRead} 
                  className={`text-xs font-medium ${accentColor.text} hover:opacity-80 px-3 py-1`}
              >
                  Mark all as read
              </button>
              <button 
                  onClick={() => setIsClearConfirmOpen(true)}
                  className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white px-3 py-1"
              >
                  Clear all
              </button>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleConfirmClear}
        title="Clear All Notifications"
        message="Are you sure you want to clear all notifications? This action cannot be undone."
      />
    </>
  );
};