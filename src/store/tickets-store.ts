import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Ticket {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  observations: string;
  returnDate: Date;
  status: string;
  color: string;
  userId: string;
}

interface TicketsState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  addTicket: (ticket: Omit<Ticket, 'id' | 'userId'>) => Promise<void>;
  updateTicket: (ticket: Ticket) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  moveTicket: (id: string, status: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useTicketsStore = create<TicketsState>((set, get) => ({
  tickets: [],
  loading: false,
  error: null,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({
        tickets: tickets.map(ticket => ({
          id: ticket.id,
          customerName: ticket.customer_name,
          customerEmail: ticket.customer_email,
          customerPhone: ticket.customer_phone,
          observations: ticket.observations,
          returnDate: new Date(ticket.return_date),
          status: ticket.status,
          color: ticket.color,
          userId: ticket.user_id,
        })),
        error: null,
      });
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
      set({ error: 'Erro ao carregar tickets' });
    } finally {
      set({ loading: false });
    }
  },

  addTicket: async (ticket) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('tickets')
        .insert([
          {
            customer_name: ticket.customerName,
            customer_email: ticket.customerEmail,
            customer_phone: ticket.customerPhone,
            observations: ticket.observations,
            return_date: ticket.returnDate.toISOString(),
            status: 'pending',
            color: ticket.color,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        tickets: [
          {
            id: data.id,
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerPhone: data.customer_phone,
            observations: data.observations,
            returnDate: new Date(data.return_date),
            status: data.status,
            color: data.color,
            userId: data.user_id,
          },
          ...state.tickets,
        ],
        error: null,
      }));
    } catch (error) {
      console.error('Erro ao adicionar ticket:', error);
      set({ error: 'Erro ao adicionar ticket' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTicket: async (ticket) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('tickets')
        .update({
          customer_name: ticket.customerName,
          customer_email: ticket.customerEmail,
          customer_phone: ticket.customerPhone,
          observations: ticket.observations,
          return_date: ticket.returnDate.toISOString(),
          status: ticket.status,
          color: ticket.color,
        })
        .eq('id', ticket.id)
        .eq('user_id', user.id);

      if (error) throw error;

      set(state => ({
        tickets: state.tickets.map(t =>
          t.id === ticket.id ? ticket : t
        ),
        error: null,
      }));
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error);
      set({ error: 'Erro ao atualizar ticket' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteTicket: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      set(state => ({
        tickets: state.tickets.filter(t => t.id !== id),
        error: null,
      }));
    } catch (error) {
      console.error('Erro ao deletar ticket:', error);
      set({ error: 'Erro ao deletar ticket' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  moveTicket: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      set(state => ({
        tickets: state.tickets.map(t =>
          t.id === id ? { ...t, status } : t
        ),
        error: null,
      }));
    } catch (error) {
      console.error('Erro ao mover ticket:', error);
      set({ error: 'Erro ao mover ticket' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));