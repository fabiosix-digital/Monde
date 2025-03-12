import React from 'react';
import { Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { StatsCard } from './stats-card';
import { Chart } from './chart';
import { useTicketsStore } from '../../store/tickets-store';
import { format, isSameMonth, subMonths, isPast, isToday } from 'date-fns';

export function Dashboard() {
  const { tickets } = useTicketsStore();

  // Calcular estatísticas
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const completedTickets = tickets.filter(t => t.status === 'completed').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
  const lateTickets = tickets.filter(t => {
    const returnDate = new Date(t.returnDate);
    return (isPast(returnDate) || isToday(returnDate)) && t.status !== 'completed';
  }).length;

  // Calcular tendências (comparação com o mês anterior)
  const lastMonth = subMonths(new Date(), 1);
  const lastMonthTickets = tickets.filter(t => 
    isSameMonth(new Date(t.returnDate), lastMonth)
  ).length;
  const currentMonthTickets = tickets.filter(t =>
    isSameMonth(new Date(t.returnDate), new Date())
  ).length;

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 100, isPositive: true };
    const trend = ((current - previous) / previous) * 100;
    return { value: Math.abs(Math.round(trend)), isPositive: trend >= 0 };
  };

  const trend = calculateTrend(currentMonthTickets, lastMonthTickets);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pendentes"
          value={pendingTickets}
          icon={Users}
          trend={trend}
        />
        <StatsCard
          title="Em Andamento"
          value={inProgressTickets}
          icon={Clock}
          trend={trend}
        />
        <StatsCard
          title="Concluídos"
          value={completedTickets}
          icon={CheckCircle}
          trend={trend}
        />
        <StatsCard
          title="Atrasados"
          value={lateTickets}
          icon={AlertCircle}
          trend={{ value: lateTickets, isPositive: false }}
          className="bg-red-50 dark:bg-red-900/20"
        />
      </div>

      <Chart tickets={tickets} />
    </div>
  );
}