import { useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Notification, Expense } from '../types';
import type { Budgets } from '../contexts/BudgetContext';

const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;

export const useNotifications = (expenses: Expense[], budgets: Budgets) => {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const generateNotifications = useCallback(() => {
    const newNotifications: Notification[] = [];
    const now = new Date();
    
    // 1. Budget Notifications
    const spentByCategoryThisMonth: Record<string, number> = {};
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getFullYear() === now.getFullYear() && expenseDate.getMonth() === now.getMonth()) {
        spentByCategoryThisMonth[expense.category] = (spentByCategoryThisMonth[expense.category] || 0) + expense.price;
      }
    });

    Object.entries(budgets).forEach(([category, budget]) => {
      if (budget > 0) {
        const spent = spentByCategoryThisMonth[category] || 0;
        const percentage = (spent / budget) * 100;

        if (percentage >= 100) {
          newNotifications.push({
            id: `budget-critical-${category}-${now.toISOString().slice(0, 7)}`,
            message: `You've gone over your budget for ${category} this month.`,
            type: 'budget_critical',
            timestamp: now.toISOString(),
            read: false,
          });
        } else if (percentage >= 85) {
          newNotifications.push({
            id: `budget-warning-${category}-${now.toISOString().slice(0, 7)}`,
            message: `You've used over 85% of your ${category} budget.`,
            type: 'budget_warning',
            timestamp: now.toISOString(),
            read: false,
          });
        }
      }
    });
    
    // 2. Reminder Notification
    if (expenses.length > 0) {
        const mostRecentExpenseDate = expenses.reduce((latest, current) => {
            return new Date(current.date) > new Date(latest.date) ? current : latest;
        }).date;

        const timeSinceLastExpense = now.getTime() - new Date(mostRecentExpenseDate).getTime();

        if (timeSinceLastExpense > THREE_DAYS_IN_MS) {
             newNotifications.push({
                id: `reminder-activity`,
                message: `It's been a few days. Don't forget to log your recent expenses!`,
                type: 'reminder',
                timestamp: now.toISOString(),
                read: false,
            });
        }
    } else {
        // If no expenses at all, add a welcome/reminder
        newNotifications.push({
            id: `reminder-welcome`,
            message: `Welcome! Upload a receipt or add an expense to get started.`,
            type: 'reminder',
            timestamp: now.toISOString(),
            read: false,
        });
    }

    // Merge new notifications with existing ones, avoiding duplicates by ID
    setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const trulyNew = newNotifications.filter(n => !existingIds.has(n.id));
        
        const updatedNotifications = [...prev, ...trulyNew];

        // Also, remove old notifications that are no longer relevant (e.g., a warning that is now critical)
        const finalNotifications = updatedNotifications.filter(n => {
            if (n.type === 'budget_warning' && newNotifications.some(nn => nn.id.replace('warning','critical') === n.id.replace('warning','critical'))) {
                return false; // Remove warning if a critical one for same category/month exists
            }
            if (n.type.startsWith('reminder-') && !newNotifications.some(nn => nn.id === n.id)) {
                return false; // Remove old reminders if not generated this time
            }
            return true;
        });

        return finalNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });

  }, [expenses, budgets, setNotifications]);

  useEffect(() => {
    generateNotifications();
  }, [expenses, budgets]); // Rerun when data changes

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [setNotifications]);
  
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  return { notifications, unreadCount, markAllAsRead, clearAllNotifications };
};
