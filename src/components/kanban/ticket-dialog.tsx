import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HexColorPicker } from 'react-colorful';
import * as Popover from '@radix-ui/react-popover';
import 'react-day-picker/dist/style.css';

interface TicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isNew?: boolean;
  initialData?: {
    id?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    observations?: string;
    returnDate?: Date;
    returnTime?: string;
    status?: string;
    color?: string;
  } | null;
  onSave: (data: any) => void;
}

export function TicketDialog({
  open,
  onOpenChange,
  isNew = true,
  initialData,
  onSave,
}: TicketDialogProps) {
  const [formData, setFormData] = React.useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    observations: '',
    returnDate: new Date(),
    returnTime: '09:00',
    status: 'pending',
    color: '#4f46e5',
  });

  React.useEffect(() => {
    if (initialData) {
      const date = new Date(initialData.returnDate || new Date());
      setFormData({
        customerName: initialData.customerName || '',
        customerEmail: initialData.customerEmail || '',
        customerPhone: initialData.customerPhone || '',
        observations: initialData.observations || '',
        returnDate: date,
        returnTime: format(date, 'HH:mm'),
        status: initialData.status || 'pending',
        color: initialData.color || '#4f46e5',
      });
    } else {
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        observations: '',
        returnDate: new Date(),
        returnTime: '09:00',
        status: 'pending',
        color: '#4f46e5',
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [hours, minutes] = formData.returnTime.split(':').map(Number);
    const returnDate = new Date(formData.returnDate);
    returnDate.setHours(hours, minutes);

    onSave({
      ...formData,
      id: initialData?.id,
      returnDate: returnDate.toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[48] bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              {isNew ? 'Novo Atendimento' : 'Editar Atendimento'}
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Coluna da esquerda - Campos do formulário */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, customerEmail: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, customerPhone: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Cor do Cartão
                  </label>
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <button
                        type="button"
                        className="mt-1 flex h-10 w-full items-center gap-2 rounded-md border border-gray-300 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600"
                      >
                        <div
                          className="h-6 w-6 rounded-md"
                          style={{ backgroundColor: formData.color }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {formData.color}
                        </span>
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        className="z-[60] rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                        align="start"
                        sideOffset={4}
                      >
                        <HexColorPicker
                          color={formData.color}
                          onChange={(color) => setFormData({ ...formData, color })}
                        />
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Status
                  </label>
                  <Select.Root
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <Select.Trigger className="mt-1 flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                      <Select.Value />
                      <Select.Icon />
                    </Select.Trigger>

                    <Select.Portal>
                      <Select.Content className="z-[60] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <Select.Viewport className="p-1">
                          <Select.Item
                            value="pending"
                            className="relative flex h-9 select-none items-center rounded px-6 py-2 text-sm text-gray-900 data-[highlighted]:bg-indigo-100 data-[highlighted]:text-indigo-900 dark:text-white dark:data-[highlighted]:bg-indigo-800"
                          >
                            <Select.ItemText>Pendente</Select.ItemText>
                          </Select.Item>
                          <Select.Item
                            value="in-progress"
                            className="relative flex h-9 select-none items-center rounded px-6 py-2 text-sm text-gray-900 data-[highlighted]:bg-indigo-100 data-[highlighted]:text-indigo-900 dark:text-white dark:data-[highlighted]:bg-indigo-800"
                          >
                            <Select.ItemText>Em Andamento</Select.ItemText>
                          </Select.Item>
                          <Select.Item
                            value="completed"
                            className="relative flex h-9 select-none items-center rounded px-6 py-2 text-sm text-gray-900 data-[highlighted]:bg-indigo-100 data-[highlighted]:text-indigo-900 dark:text-white dark:data-[highlighted]:bg-indigo-800"
                          >
                            <Select.ItemText>Concluído</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Observações
                  </label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) =>
                      setFormData({ ...formData, observations: e.target.value })
                    }
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Coluna da direita - Calendário e Hora */}
              <div className="flex flex-col items-center justify-start space-y-4">
                <div className="w-full rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-700">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Data de Retorno
                  </label>
                  <DayPicker
                    mode="single"
                    selected={formData.returnDate}
                    onSelect={(date) =>
                      setFormData({ ...formData, returnDate: date || new Date() })
                    }
                    locale={ptBR}
                    className="rounded-md bg-white p-3 dark:bg-gray-700"
                    classNames={{
                      day_selected: 'bg-indigo-600 text-white dark:bg-blue-600',
                      day_today: 'font-bold text-indigo-600 dark:text-blue-400',
                    }}
                  />
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Horário de Retorno
                  </label>
                  <input
                    type="time"
                    value={formData.returnTime}
                    onChange={(e) =>
                      setFormData({ ...formData, returnTime: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isNew ? 'Criar' : 'Salvar'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}