import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useThemeStore } from '../../store/theme-store';
import { format, eachMonthOfInterval, startOfYear, endOfYear, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChartProps {
  tickets: any[];
}

export function Chart({ tickets }: ChartProps) {
  const { isDark } = useThemeStore();

  // Gerar dados do gráfico
  const months = eachMonthOfInterval({
    start: startOfYear(new Date()),
    end: endOfYear(new Date()),
  });

  const data = months.map(month => ({
    name: format(month, 'MMM', { locale: ptBR }),
    atendimentos: tickets.filter(ticket => 
      isSameMonth(new Date(ticket.returnDate), month)
    ).length,
  }));

  return (
    <div className="h-[400px] w-full rounded-xl border-0 p-6 shadow-lg dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 bg-gradient-to-br from-white to-gray-50">
      <h3 className="mb-4 text-lg font-bold text-indigo-600 dark:text-blue-400">
        Atendimentos por Mês
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAtendimentos" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isDark ? '#2563eb' : '#4f46e5'}
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor={isDark ? '#2563eb' : '#4f46e5'}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
            opacity={0.2}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? '#94a3b8' : '#4b5563' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? '#94a3b8' : '#4b5563' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              border: isDark
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            itemStyle={{ color: isDark ? '#e2e8f0' : '#1f2937' }}
            labelStyle={{ color: isDark ? '#94a3b8' : '#6b7280' }}
          />
          <Area
            type="monotone"
            dataKey="atendimentos"
            stroke={isDark ? '#3b82f6' : '#4f46e5'}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAtendimentos)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}