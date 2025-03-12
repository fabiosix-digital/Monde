import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border-0 p-6 shadow-lg',
        'dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800',
        'bg-gradient-to-br from-white to-gray-50',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-indigo-600 dark:text-blue-400">{title}</p>
        <Icon className="h-5 w-5 text-indigo-600 dark:text-blue-400" />
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
        )}
        {trend && (
          <div className="mt-3 flex items-center gap-2">
            <span
              className={cn(
                'text-sm font-medium',
                trend.isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {trend.isPositive ? '+' : '-'}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">vs. último mês</span>
          </div>
        )}
      </div>
    </div>
  );
}