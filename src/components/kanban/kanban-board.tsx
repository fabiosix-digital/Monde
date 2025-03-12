import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { CalendarView } from './calendar-view';
import { TicketDialog } from './ticket-dialog';
import { DeleteDialog } from './delete-dialog';
import { Plus, Calendar, List } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { useTicketsStore } from '../../store/tickets-store';
import { useNavigate, useLocation } from 'react-router-dom';

const defaultColumns = [
  { id: 'pending', title: 'Pendentes', color: 'bg-yellow-500' },
  { id: 'in-progress', title: 'Em Andamento', color: 'bg-blue-500' },
  { id: 'completed', title: 'Concluídos', color: 'bg-green-500' },
  { id: 'late', title: 'Atrasados', color: 'bg-red-500' },
];

const viewOptions = [
  { id: 'kanban', label: 'Kanban', icon: List },
  { id: 'day', label: 'Dia', icon: Calendar },
  { id: 'week', label: 'Semana', icon: Calendar },
  { id: 'month', label: 'Mês', icon: Calendar },
  { id: 'year', label: 'Ano', icon: Calendar },
];

export function KanbanBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    tickets,
    loading,
    addTicket,
    updateTicket,
    deleteTicket,
    moveTicket,
    initialize,
  } = useTicketsStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [viewMode, setViewMode] = useState('kanban');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Verificar atendimentos atrasados a cada minuto
  useEffect(() => {
    const checkLateTickets = () => {
      tickets.forEach(ticket => {
        const returnDate = new Date(ticket.returnDate);
        const isLate = (isPast(returnDate) || isToday(returnDate)) && ticket.status !== 'completed';
        
        if (isLate && ticket.status !== 'late') {
          moveTicket(ticket.id, 'late');
        }
      });
    };

    // Verificar imediatamente
    checkLateTickets();

    // Configurar verificação periódica
    const interval = setInterval(checkLateTickets, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, [tickets, moveTicket]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('from') === 'notification') {
      setViewMode('kanban');
    }
  }, [location]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const overId = over.id as string;
    
    if (defaultColumns.find(col => col.id === overId)) {
      try {
        await moveTicket(active.id as string, overId);
      } catch (error) {
        console.error('Erro ao mover ticket:', error);
      }
    }

    setActiveId(null);
  };

  const handleDragOver = async (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const overId = over.id as string;
    const activeId = active.id as string;

    if (defaultColumns.find(col => col.id === overId)) {
      const ticket = tickets.find(t => t.id === activeId);
      if (ticket && ticket.status !== overId) {
        try {
          await moveTicket(activeId, overId);
        } catch (error) {
          console.error('Erro ao mover ticket:', error);
        }
      }
    }
  };

  const handleEditTicket = (ticket: any) => {
    setEditingTicket(ticket);
    setDialogOpen(true);
  };

  const handleSaveTicket = async (data: any) => {
    try {
      if (editingTicket) {
        await updateTicket({
          ...editingTicket,
          ...data,
          returnDate: new Date(data.returnDate),
        });
      } else {
        await addTicket({
          ...data,
          returnDate: new Date(data.returnDate),
        });
      }
      setDialogOpen(false);
      setEditingTicket(null);
    } catch (error) {
      console.error('Erro ao salvar ticket:', error);
    }
  };

  const handleDeleteTicket = async () => {
    if (editingTicket) {
      try {
        await deleteTicket(editingTicket.id);
        setDeleteDialogOpen(false);
        setEditingTicket(null);
      } catch (error) {
        console.error('Erro ao deletar ticket:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setEditingTicket(null);
              setDialogOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Novo Atendimento
          </button>

          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
            {viewOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setViewMode(option.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
                  viewMode === option.id
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <option.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex-1 min-h-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <div className="h-full flex gap-4 overflow-x-auto">
              {defaultColumns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  color={column.color}
                >
                  <SortableContext
                    items={tickets
                      .filter((ticket) => ticket.status === column.id)
                      .map((ticket) => ticket.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tickets
                      .filter((ticket) => ticket.status === column.id)
                      .map((ticket) => (
                        <KanbanCard
                          key={ticket.id}
                          id={ticket.id}
                          card={ticket}
                          onEdit={() => handleEditTicket(ticket)}
                          onDelete={() => {
                            setEditingTicket(ticket);
                            setDeleteDialogOpen(true);
                          }}
                        />
                      ))}
                  </SortableContext>
                </KanbanColumn>
              ))}
            </div>

            <DragOverlay>
              {activeId ? (
                <KanbanCard
                  id={activeId}
                  card={tickets.find((ticket) => ticket.id === activeId)}
                  isDragging
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <CalendarView
            cards={tickets}
            viewMode={viewMode}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onCardClick={(card) => handleEditTicket(card)}
          />
        </div>
      )}

      <TicketDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isNew={!editingTicket}
        initialData={editingTicket}
        onSave={handleSaveTicket}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteTicket}
        title={editingTicket?.customerName}
      />
    </div>
  );
}