import { Department } from '@/types/user';
import { BASE_URL } from '@/utils/constants';
import { create } from 'zustand';

interface DepartmentState {
  departments: Department[];
  loading: boolean;
  error: string | null;
  fetchDepartments: (organizationId: number) => Promise<void>;
  upsertDepartment: (department: Omit<Department, 'id'> & { id?: number }) => Promise<void>;
  deleteDepartment: (departmentId: number) => Promise<void>;
  getDepartmentUserCount: (departmentId: number, organizationId: number) => Promise<number>;
}

export const useDepartmentStore = create<DepartmentState>((set, get) => ({
  departments: [],
  loading: false,
  error: null,

  fetchDepartments: async (organizationId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${BASE_URL}/departments?organizationId=${organizationId}`);
      const data = await response.json();
      set({ departments: mapToDepartment(data), loading: false });
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      set({ error: 'Falha ao buscar departamentos.', loading: false });
    }
  },

  upsertDepartment: async (department) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(department),
      });
      const savedDepartment = await response.json();

      const filteredDepartments = get().departments.filter((d) => d.id !== savedDepartment.id);

      // Create
      set((_) => ({
        departments: mapToDepartment([...filteredDepartments, savedDepartment]),
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to upsert department:", error);
      set({ error: 'Falha ao salvar o departamento.', loading: false });
    }
  },

  deleteDepartment: async (departmentId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${BASE_URL}/departments/${departmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete department');
      }
      
      set((state) => ({
        departments: state.departments.filter((d) => d.id !== departmentId),
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to delete department:", error);
      set({ error: 'Falha ao deletar o departamento.', loading: false });
    }
  },

  getDepartmentUserCount: async (departmentId: number, organizationId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${BASE_URL}/departments/${departmentId}/user-count?organizationId=${organizationId}`);
      const data = await response.json();
      set({ loading: false });
      return data.count || 0;
    } catch (error) {
      console.error("Failed to fetch department users:", error);
      set({ error: 'Falha ao buscar usuários do departamento.', loading: false });
      return 0;
    }
  }
}));

function mapToDepartment(data: any[]): Department[] {
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    organizationId: item.organization_id,
    managerName: item.manager_name,
    createdAt: item.created_at,
  }));
};