import { User } from '@/types/user';
import { BASE_URL } from '@/utils/constants';
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  checkSession: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  getLoggedUser: () => Promise<any>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<any>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  organization: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),

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
      set({ user: data.user, loading: false });
      return data;
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
  },

  resetPassword: async (email: string) => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    if (!res.ok) {
      set({ error: 'Falha ao realizar reset de senha' });
      return;
    }
  }, 

  checkSession: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/auth/session`);
      if (!res.ok) throw new Error('Sessão inválida');
      const data = await res.json();
      set({ loading: false });
      return data;
    } catch (error: any) {
      console.error('Error checking session:', error);
      set({ error: error.message, loading: false });
      return { expired: true };
    }
  },

  getLoggedUser: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/auth/me`);
      if (!res.ok) throw new Error('Falha ao buscar usuário');
      const data = await res.json();
      set({ user: mapToUser(data.user), loading: false });
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) throw new Error('Falha ao trocar a senha');
      const data = await res.json();
      set({ loading: false });
      console.log('Change password response data:', data);
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  }
}));

const mapToUser = (data: any): User | null => {
  if (!data) {
    return null;
  }
  return {
    id: data.id,
    authId: data.auth_id,
    fullname: data.name + ' ' + data.surname,
    name: data.name,
    surname: data.surname,
    email: data.email,
    phone: data.phone,
    status: data.status,
    language: data.language,
    timezone: data.timezone,
    locationName: data.location_name,
    organizationId: data.organization_id,
    departmentId: data.department_id,
    jobId: data.job_id,
    permissions: data.permissions,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};