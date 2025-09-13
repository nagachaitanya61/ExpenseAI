import React, { useState } from 'react';
import { useSavingsGoals } from '../contexts/SavingsGoalContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import type { SavingsGoal } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { TargetIcon } from './icons/TargetIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ConfirmationModal } from './ConfirmationModal';

const GoalForm: React.FC<{ goal?: SavingsGoal, onSave: () => void }> = ({ goal, onSave }) => {
    const { addGoal, updateGoal } = useSavingsGoals();
    const { currency } = useCurrency();
    const { accentColor } = useTheme();

    const [name, setName] = useState(goal?.name || '');
    const [targetAmount, setTargetAmount] = useState(goal?.targetAmount.toString() || '');
    const [savedAmount, setSavedAmount] = useState(goal?.savedAmount.toString() || '0');
    const [deadline, setDeadline] = useState(goal?.deadline || new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const targetNum = parseFloat(targetAmount);
        const savedNum = parseFloat(savedAmount);

        if (!name || isNaN(targetNum) || targetNum <= 0 || isNaN(savedNum) || savedNum < 0) {
            alert("Please fill out all fields with valid values.");
            return;
        }

        const goalData = { name, targetAmount: targetNum, savedAmount: savedNum, deadline };
        if (goal) {
            updateGoal({ ...goalData, id: goal.id });
        } else {
            addGoal(goalData);
        }
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{goal ? 'Edit' : 'Set a New'} Goal</h3>
            <div>
                <label htmlFor="goal-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Name</label>
                <input id="goal-name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Vacation Fund" className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md ${accentColor.focusRing} ${accentColor.focusBorder}`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="goal-target" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Amount ({currency.symbol})</label>
                    <input id="goal-target" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required min="0.01" step="0.01" className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md ${accentColor.focusRing} ${accentColor.focusBorder}`} />
                </div>
                 <div>
                    <label htmlFor="goal-saved" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Already Saved ({currency.symbol})</label>
                    <input id="goal-saved" type="number" value={savedAmount} onChange={e => setSavedAmount(e.target.value)} required min="0" step="0.01" className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md ${accentColor.focusRing} ${accentColor.focusBorder}`} />
                </div>
            </div>
            <div>
                <label htmlFor="goal-deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                <input id="goal-deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required className={`w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md ${accentColor.focusRing} ${accentColor.focusBorder}`} />
            </div>
            <div className="flex justify-end pt-2">
                 <button type="submit" className={`bg-accent-600 text-white font-bold py-2 px-4 rounded-md hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${accentColor.focusRing} transition-colors`}>
                    Save Goal
                </button>
            </div>
        </form>
    )
}

export const GoalsPage: React.FC<{ expenses: any[] }> = ({ expenses }) => {
  const { goals, removeGoal } = useSavingsGoals();
  const { currency } = useCurrency();
  const { accentColor } = useTheme();
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (deletingGoalId) {
        removeGoal(deletingGoalId);
        setDeletingGoalId(null);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <TargetIcon className={`w-12 h-12 ${accentColor.text} mx-auto mb-4`} />
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Savings Goals</h2>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Define your financial goals to stay motivated. Track your progress and let our AI coach help you get there.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
             <GoalForm key={editingGoal?.id || 'new'} goal={editingGoal || undefined} onSave={() => setEditingGoal(null)} />
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Goals</h3>
            {goals.length > 0 ? (
                <div className="space-y-4">
                    {goals.map(goal => {
                        const progress = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
                        const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                        return (
                            <div key={goal.id} className="bg-gray-100/50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <p className="font-bold text-lg text-gray-900 dark:text-white">{goal.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Deadline passed'}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => setEditingGoal(goal)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => setDeletingGoalId(goal.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        <span>{formatCurrency(goal.savedAmount, currency)}</span>
                                        <span>{formatCurrency(goal.targetAmount, currency)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                                        <div className={`${accentColor.bg} h-4 rounded-full flex items-center justify-center text-xs font-bold text-white`} style={{ width: `${Math.min(progress, 100)}%` }}>
                                            {progress.toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">You haven't set any savings goals yet.</p>
            )}
        </div>
      </div>
      {deletingGoalId && (
        <ConfirmationModal
          isOpen={!!deletingGoalId}
          onClose={() => setDeletingGoalId(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Savings Goal"
          message="Are you sure you want to delete this goal? This action cannot be undone."
        />
      )}
    </div>
  );
};