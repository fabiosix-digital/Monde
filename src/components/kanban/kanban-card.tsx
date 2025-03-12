import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KanbanCardProps {
  id: string;
  card: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    observations: string;
    returnDate: Date;
    status: string;
    color: string;
  };
  isDragging?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function KanbanCard({
  id,
  card,
  isDragging,
  onEdit,
  onDelete,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Separar os listeners do drag dos listeners dos botões
  const dragListeners = {
    ...listeners,
    onMouseDown: (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        e.stopPropagation();
      } else {
        listeners?.onMouseDown?.(e);
      }
    },
  };

  return (
    <motion.div
      layout
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...dragListeners}
      className={cn(
        'group relative space-y-2 rounded-lg p-4 shadow-sm transition-all hover:shadow-md',
        isDragging ? 'opacity-50' : '',
        'bg-white dark:bg-gray-800'
      )}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">
          {card.customerName}
        </h4>
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: card.color }}
          />
          <div className="flex gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="z-10 rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="z-10 rounded p-1.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Excluir</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Mail className="h-4 w-4" />
          <span>{card.customerEmail}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Phone className="h-4 w-4" />
          <span>{card.customerPhone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(card.returnDate), "dd 'de' MMMM", { locale: ptBR })}
          </span>
        </div>
      </div>

      {card.observations && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {card.observations}
        </p>
      )}
    </motion.div>
  );
}