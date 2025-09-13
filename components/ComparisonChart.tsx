import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useTheme } from '../contexts/ThemeContext';

interface ComparisonChartProps {
    data: {
        currentTotal: number;
        comparisonTotal: number;
        currentLabel: string;
        comparisonLabel: string;
    }
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ data }) => {
    const { currency } = useCurrency();
    const { theme, accent } = useTheme();

    const chartData = [
        {
            name: data.currentLabel,
            Total: data.currentTotal,
        },
        {
            name: data.comparisonLabel,
            Total: data.comparisonTotal,
        }
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800/80 dark:bg-gray-950/80 p-4 rounded-lg border border-gray-700 dark:border-gray-600 text-white">
                    <p className="label">{`${label}`}</p>
                    <p className={`intro font-semibold`}>{`Total: ${formatCurrency(payload[0].value, currency)}`}</p>
                </div>
            );
        }
        return null;
    };

    const accentRGB = accent === 'cyan' ? 'rgb(6 182 212)' : accent === 'indigo' ? 'rgb(99 102 241)' : 'rgb(236 72 153)';
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
    const textColor = theme === 'dark' ? '#9ca3af' : '#6b7280';

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" stroke={textColor} fontSize={12} />
                    <YAxis stroke={textColor} fontSize={12} tickFormatter={(tick) => formatCurrency(tick, currency)} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(107, 114, 128, 0.2)' }}/>
                    <Legend wrapperStyle={{ color: textColor, fontSize: '14px' }}/>
                    <Bar dataKey="Total" fill={accentRGB} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};