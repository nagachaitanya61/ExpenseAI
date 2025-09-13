// Fix: Define the Expense and ExtractedItem types used throughout the application.
export interface Expense {
  id: string;
  name:string;
  category: string;
  price: number;
  date: string; // YYYY-MM-DD format
  splitGroupId?: string; // Optional ID to link split expenses
}

export interface ExtractedItem {
  name: string;
  category: string;
  price: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'budget_warning' | 'budget_critical' | 'reminder';
  timestamp: string; // ISO string
  read: boolean;
}

export interface RecurringExpense {
  id: string;
  name: string;
  category: string;
  price: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  startDate: string; // YYYY-MM-DD
  lastAddedDate: string; // YYYY-MM-DD
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string; // YYYY-MM-DD
}
