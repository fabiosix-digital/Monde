import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initial data for tickets
export const initialTickets = [
  {
    id: '1',
    customerName: 'João Silva',
    customerEmail: 'joao.silva@email.com',
    customerPhone: '(11) 98765-4321',
    observations: 'Problema com login no sistema',
    returnDate: new Date(2025, 4, 1, 9, 0),
    status: 'pending',
    color: '#f59e0b',
  },
  {
    id: '2',
    customerName: 'Maria Santos',
    customerEmail: 'maria.santos@email.com',
    customerPhone: '(11) 91234-5678',
    observations: 'Atualização de cadastro',
    returnDate: new Date(2025, 4, 2, 10, 30),
    status: 'in-progress',
    color: '#3b82f6',
  },
  {
    id: '3',
    customerName: 'Pedro Oliveira',
    customerEmail: 'pedro.oliveira@email.com',
    customerPhone: '(11) 99876-5432',
    observations: 'Suporte técnico - Impressora',
    returnDate: new Date(2025, 4, 3, 14, 0),
    status: 'completed',
    color: '#10b981',
  },
  {
    id: '4',
    customerName: 'Ana Costa',
    customerEmail: 'ana.costa@email.com',
    customerPhone: '(11) 94567-8901',
    observations: 'Treinamento novo sistema',
    returnDate: new Date(2025, 4, 5, 11, 0),
    status: 'pending',
    color: '#8b5cf6',
  },
  {
    id: '5',
    customerName: 'Lucas Ferreira',
    customerEmail: 'lucas.ferreira@email.com',
    customerPhone: '(11) 93456-7890',
    observations: 'Configuração de email',
    returnDate: new Date(2025, 4, 7, 15, 30),
    status: 'in-progress',
    color: '#ec4899',
  },
  {
    id: '6',
    customerName: 'Beatriz Lima',
    customerEmail: 'beatriz.lima@email.com',
    customerPhone: '(11) 92345-6789',
    observations: 'Instalação de software',
    returnDate: new Date(2025, 4, 8, 13, 0),
    status: 'completed',
    color: '#6366f1',
  },
  {
    id: '7',
    customerName: 'Carlos Rodrigues',
    customerEmail: 'carlos.rodrigues@email.com',
    customerPhone: '(11) 98901-2345',
    observations: 'Manutenção preventiva',
    returnDate: new Date(2025, 4, 10, 10, 0),
    status: 'pending',
    color: '#14b8a6',
  },
  {
    id: '8',
    customerName: 'Fernanda Alves',
    customerEmail: 'fernanda.alves@email.com',
    customerPhone: '(11) 97890-1234',
    observations: 'Backup de dados',
    returnDate: new Date(2025, 4, 12, 16, 0),
    status: 'in-progress',
    color: '#f43f5e',
  },
  {
    id: '9',
    customerName: 'Roberto Santos',
    customerEmail: 'roberto.santos@email.com',
    customerPhone: '(11) 96789-0123',
    observations: 'Atualização de sistema',
    returnDate: new Date(2025, 4, 15, 9, 30),
    status: 'completed',
    color: '#0ea5e9',
  },
  {
    id: '10',
    customerName: 'Amanda Oliveira',
    customerEmail: 'amanda.oliveira@email.com',
    customerPhone: '(11) 95678-9012',
    observations: 'Configuração de rede',
    returnDate: new Date(2025, 4, 17, 14, 30),
    status: 'pending',
    color: '#a855f7',
  },
];