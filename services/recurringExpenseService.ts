import type { RecurringExpense, Expense } from '../types';

export const generateDueExpenses = (
  recurringExpenses: RecurringExpense[],
  lastCheckDate: Date,
  today: Date
): { dueExpenses: Omit<Expense, 'id'>[], updatedRecurringExpenses: RecurringExpense[] } => {
  const dueExpenses: Omit<Expense, 'id'>[] = [];
  const updatedRecurringExpenses = [...recurringExpenses];

  recurringExpenses.forEach((recurring, index) => {
    let nextDueDate = new Date(recurring.lastAddedDate);
    const startDate = new Date(recurring.startDate);

    // If lastAddedDate is before startDate, start checking from startDate
    if (nextDueDate < startDate) {
      nextDueDate = new Date(startDate);
      // Adjust because lastAddedDate is the day before, so we add the interval to get the first due date.
      nextDueDate.setDate(nextDueDate.getDate() - 1);
    }
    
    // Loop to add all due expenses between last check and today
    while (true) {
        switch (recurring.frequency) {
            case 'weekly':
                nextDueDate.setDate(nextDueDate.getDate() + 7);
                break;
            case 'monthly':
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                break;
            case 'yearly':
                nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                break;
        }

        // Stop if the next due date is in the future
        if (nextDueDate > today) {
            break;
        }

        // Only add if it's on or after the official start date and after the last check
        if (nextDueDate >= startDate && nextDueDate > new Date(recurring.lastAddedDate)) {
             dueExpenses.push({
                name: recurring.name,
                category: recurring.category,
                price: recurring.price,
                date: nextDueDate.toISOString().split('T')[0],
            });
            // Update the last added date for this expense
            updatedRecurringExpenses[index].lastAddedDate = nextDueDate.toISOString().split('T')[0];
        }
    }
  });

  return { dueExpenses, updatedRecurringExpenses };
};
