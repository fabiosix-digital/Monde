import React from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CalendarViewProps {
  cards: any[];
  viewMode: string;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onCardClick: (card: any) => void;
}

export function CalendarView({
  cards,
  viewMode,
  selectedDate,
  onDateChange,
  onCardClick,
}: CalendarViewProps) {
  const renderDayView = () => {
    const dayCards = cards.filter((card) =>
      isSameDay(new Date(card.returnDate), selectedDate)
    );

    return (
      <div className="grid h-full grid-cols-1 gap-4">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDateChange(subDays(selectedDate, 1))}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDateChange(addDays(selectedDate, 1))}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 p-4">
          {dayCards.map((card) => (
            <div
              key={card.id}
              onClick={() => onCardClick(card)}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              style={{ borderLeft: `4px solid ${card.color}` }}
            >
              <h3 className="font-medium">{card.customerName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(card.returnDate), 'HH:mm')}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const start = startOfWeek(selectedDate, { locale: ptBR });
    const end = endOfWeek(selectedDate, { locale: ptBR });
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">
            {format(start, "d 'de' MMMM", { locale: ptBR })} -{' '}
            {format(end, "d 'de' MMMM", { locale: ptBR })}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDateChange(subWeeks(selectedDate, 1))}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDateChange(addWeeks(selectedDate, 1))}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-7 gap-4 p-4">
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="flex flex-col gap-2"
            >
              <div className="text-center">
                <div className="text-sm font-medium">
                  {format(day, 'EEEE', { locale: ptBR })}
                </div>
                <div className="text-2xl font-semibold">{format(day, 'd')}</div>
              </div>
              <div className="space-y-2">
                {cards
                  .filter((card) => isSameDay(new Date(card.returnDate), day))
                  .map((card) => (
                    <div
                      key={card.id}
                      onClick={() => onCardClick(card)}
                      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-2 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                      style={{ borderLeft: `4px solid ${card.color}` }}
                    >
                      <div className="font-medium">{card.customerName}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {format(new Date(card.returnDate), 'HH:mm')}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });
    const startWeek = startOfWeek(start, { locale: ptBR });
    const endWeek = endOfWeek(end, { locale: ptBR });
    const allDays = eachDayOfInterval({ start: startWeek, end: endWeek });

    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">
            {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDateChange(subMonths(selectedDate, 1))}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDateChange(addMonths(selectedDate, 1))}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200 p-4 dark:bg-gray-700">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {day}
            </div>
          ))}
          {allDays.map((day) => {
            const isCurrentMonth = isSameMonth(day, selectedDate);
            const dayCards = cards.filter((card) =>
              isSameDay(new Date(card.returnDate), day)
            );

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[100px] bg-white p-1 dark:bg-gray-800',
                  !isCurrentMonth && 'opacity-50'
                )}
              >
                <div className="text-right text-sm">{format(day, 'd')}</div>
                <div className="mt-1 space-y-1">
                  {dayCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => onCardClick(card)}
                      className="cursor-pointer rounded bg-gray-100 p-1 text-xs dark:bg-gray-700"
                      style={{ borderLeft: `3px solid ${card.color}` }}
                    >
                      {card.customerName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const start = startOfYear(selectedDate);
    const end = endOfYear(selectedDate);
    const months = eachMonthOfInterval({ start, end });

    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">
            {format(selectedDate, 'yyyy', { locale: ptBR })}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDateChange(subMonths(selectedDate, 12))}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDateChange(addMonths(selectedDate, 12))}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 p-4">
          {months.map((month) => {
            const monthCards = cards.filter(
              (card) => isSameMonth(new Date(card.returnDate), month)
            );

            return (
              <div
                key={month.toISOString()}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <h3 className="mb-2 text-center font-medium">
                  {format(month, 'MMMM', { locale: ptBR })}
                </h3>
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {monthCards.length} atendimentos
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  switch (viewMode) {
    case 'day':
      return renderDayView();
    case 'week':
      return renderWeekView();
    case 'month':
      return renderMonthView();
    case 'year':
      return renderYearView();
    default:
      return null;
  }
}