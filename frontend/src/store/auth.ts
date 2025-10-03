import { BASE_URL } from '@/utils/constants';
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Falha no login');
      const data = await res.json();
      set({ user: data.user, token: data.token, loading: false });
      localStorage.setItem('token', data.token);
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  register: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Falha ao criar conta');
      const data = await res.json();
      set({ user: data.user, token: data.token, loading: false });
      localStorage.setItem('token', data.token);
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  logout: async () => {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    if (!res.ok) {
      set({ error: 'Falha ao realizar logout' });
      return;
    }
    set({ user: null, token: null });
    localStorage.removeItem('token');
  },

  checkSession: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null });
      return;
    }
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/auth/session`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Sessão inválida');
      const data = await res.json();
      set({ user: data.user, token, loading: false });
    } catch (error: any) {
      set({ user: null, token: null, error: error.message, loading: false });
      localStorage.removeItem('token');
    }
  },
}));