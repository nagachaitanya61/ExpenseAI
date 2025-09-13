import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import type { Expense } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/formatCurrency';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { StarIcon } from './icons/StarIcon';

interface SpendingTrendsProps {
  expenses: Expense[];
}

export const SpendingTrends: React.FC<SpendingTrendsProps> = ({ expenses }) => {
  const { currency } = useCurrency();
  const { theme, accent } = useTheme();

  const { stats, chartData } = useMemo(() => {
    if (expenses.length === 0) {
      return { stats: { total: 0, avgDaily: 0, avgMonthly: 0, highestDay: { date: '-', amount: 0 } }, chartData: [] };
    }

    const dailyTotals: { [date: string]: number } = {};
    const monthlyTotals: { [month: string]: Set<string> } = {};

    expenses.forEach(expense => {
      const date = expense.date; // YYYY-MM-DD
      const month = date.substring(0, 7); // YYYY-MM

      dailyTotals[date] = (dailyTotals[date] || 0) + expense.price;
      
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = new Set();
      }
      monthlyTotals[month].add(date);
    });
    
    const totalSpend = expenses.reduce((sum, e) => sum + e.price, 0);
    const numDays = Object.keys(dailyTotals).length;
    const numMonths = Object.keys(monthlyTotals).length;

    const avgDaily = numDays > 0 ? totalSpend / numDays : 0;
    const avgMonthly = numMonths > 0 ? totalSpend / numMonths : 0;
    
    let highestDay = { date: '-', amount: 0 };
    for (const [date, amount] of Object.entries(dailyTotals)) {
        if (amount > highestDay.amount) {
            highestDay = { date, amount };
        }
    }

    const sortedChartData = Object.entries(dailyTotals)
      .map(([date, amount]) => ({
        date,
        amount,
        formattedDate: new Date(date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      stats: { total: totalSpend, avgDaily, avgMonthly, highestDay },
      chartData: sortedChartData
    };

  }, [expenses]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/80 dark:bg-gray-950/80 p-4 rounded-lg border border-gray-700 dark:border-gray-600 text-white">
          <p className="label">{new Date(label + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className={`intro font-semibold`}>{`Total: ${formatCurrency(payload[0].value, currency)}`}</p>
        </div>
      );
    }
    return null;
  };
  
  const accentRGB = accent === 'cyan' ? 'rgb(6 182 212)' : accent === 'indigo' ? 'rgb(99 102 241)' : 'rgb(236 72 153)';
  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const textColor = theme === 'dark' ? '#9ca3af' : '#6b7280';

  const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string | React.ReactNode }> = ({ icon, title, value }) => (
    <div className="bg-gray-100/50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
      <div className="bg-white dark:bg-gray-800 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUpIcon className={`w-6 h-6 text-gray-500 dark:text-gray-400`} />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Spending Trends</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
            icon={<CalendarDaysIcon className={`w-6 h-6 text-gray-500 dark:text-gray-400`} />} 
            title="Avg. Daily Spend" 
            value={formatCurrency(stats.avgDaily, currency)} 
        />
        <StatCard 
            icon={<CalendarDaysIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />} 
            title="Avg. Monthly Spend" 
            value={formatCurrency(stats.avgMonthly, currency)} 
        />
        <StatCard 
            icon={<StarIcon className="w-6 h-6 text-amber-500 dark:text-amber-400" />} 
            title="Highest Spending Day" 
            value={
              <span>
                {formatCurrency(stats.highestDay.amount, currency)}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  on {stats.highestDay.date !== '-' ? new Date(stats.highestDay.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                </span>
              </span>
            }
        />
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="formattedDate" stroke={textColor} fontSize={12} />
            <YAxis stroke={textColor} fontSize={12} tickFormatter={(tick) => formatCurrency(tick, currency)} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: accentRGB, strokeWidth: 1 }} />
            <Legend wrapperStyle={{ color: textColor, fontSize: '14px' }} />
            <Line type="monotone" dataKey="amount" name="Daily Total" stroke={accentRGB} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};