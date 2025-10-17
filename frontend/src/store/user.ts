import { User } from '@/types/user';
import { BASE_URL } from '@/utils/constants';
import { create } from 'zustand';

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: (organizationId: number) => Promise<void>;
  upsertUser: (user: User) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  fetchUsers: async (organizationId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${BASE_URL}/users?organizationId=${organizationId}`);
      const data = await response.json();
      set({ users: mapToUser(data), loading: false });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      set({ error: 'Falha ao buscar usuários.', loading: false });
    }
  },
  upsertUser: async (user) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      const savedUser = await response.json();
      const filteredUsers = get().users.filter((d) => d.id !== savedUser.id);

      set((_) => ({
        users: [...filteredUsers, savedUser],
        loading: false,
      }));
      
    } catch (error) {
      console.error("Failed to upsert user:", error);
      set({ error: 'Falha ao salvar o usuário.', loading: false });
    }
  },
  deleteUser: async (userId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'DELETE',
      });
      await response.json();

      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to delete user:", error);
      set({ error: 'Falha ao deletar o usuário.', loading: false });
    }
  },
}));

function mapToUser(data: any[]): User[] {
  return data.map((item) => ({
    id: item.id,
    organizationId: item.organization_id,
    name: item.name,
    surname: item.surname,
    fullname: item.name + ' ' + item.surname,
    email: item.email,
    phone: item.phone,
    jobId: item.job_id,
    departmentId: item.department_id,
    status: item.status,
    authId: item.auth_id,
    permissions: item.permissions,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}