import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MondeConfig {
  baseUrl: string;
  token: string | null;
}

interface MondeState extends MondeConfig {
  setConfig: (config: MondeConfig) => void;
  clearConfig: () => void;
}

export const useMondeStore = create<MondeState>()(
  persist(
    (set) => ({
      baseUrl: '',
      token: null,
      setConfig: (config) => set(config),
      clearConfig: () => set({ baseUrl: '', token: null }),
    }),
    {
      name: 'monde-config',
    }
  )
);

interface AuthResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      login: string;
      token: string;
    };
  };
}

export class MondeAPI {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string, token: string | null = null) {
    // Remove protocolo e www se fornecidos
    this.baseUrl = baseUrl.replace(/^(https?:\/\/)?(www\.)?/, '');
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `https://web.monde.com.br/api/v2/${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.detail || 'Erro na requisição');
      }

      return data;
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
      }
      throw error;
    }
  }

  async authenticate(login: string, password: string): Promise<string> {
    try {
      // Se o login não contiver @, adiciona o domínio
      if (!login.includes('@')) {
        login = `${login}@${this.baseUrl}`;
      }

      const response = await this.request<AuthResponse>('tokens', {
        method: 'POST',
        body: JSON.stringify({
          data: {
            type: 'tokens',
            attributes: {
              login,
              password,
            },
          },
        }),
      });

      this.token = response.data.attributes.token;
      return this.token;
    } catch (error: any) {
      const errorMessages: Record<string, string> = {
        'Invalid login credentials': 'Credenciais inválidas',
        'User not found': 'Usuário não encontrado',
        'Invalid password': 'Senha inválida',
        'Failed to fetch': 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
      };

      const message = errorMessages[error.message] || error.message || 'Erro ao autenticar';
      throw new Error(message);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.request('cities?page[size]=1');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getCities(search?: string) {
    const params = new URLSearchParams();
    if (search) {
      params.append('filter[search]', search);
    }
    return this.request(`cities?${params.toString()}`);
  }

  async getPeople(search?: string, onlyUsers?: boolean) {
    const params = new URLSearchParams();
    if (search) {
      params.append('filter[search]', search);
    }
    if (onlyUsers) {
      params.append('filter[only_users]', 'true');
    }
    return this.request(`people?${params.toString()}`);
  }

  async getTaskHistories(taskId: string) {
    return this.request(`tasks/${taskId}/histories`);
  }

  async getTasks(search?: string) {
    const params = new URLSearchParams();
    if (search) {
      params.append('filter[search]', search);
    }
    return this.request(`tasks?${params.toString()}`);
  }
}