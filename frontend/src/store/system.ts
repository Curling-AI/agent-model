import { Plan, ServiceProvider } from '@/types';
import { ConversationTag } from '@/types/conversation';
import { FollowUpTrigger } from '@/types/follow_up';
import { Department, Job, Permission } from '@/types/user';
import { BASE_URL } from '@/utils/constants';
import { create } from 'zustand';

type SystemStore = {
  jobs: Job[];
  departments: Department[];
  conversationTags: ConversationTag[];
  plans: Plan[];
  permissions: Permission[];
  serviceProviders: ServiceProvider[];
  followUpTriggers: FollowUpTrigger[];
  loading: boolean;
  error: string | null;
  fetchJobs: (organizationId: number) => Promise<void>;
  fetchDepartments: (organizationId: number) => Promise<void>;
  fetchConversationTags: (organizationId: number) => Promise<void>;
  fetchPlans: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
  fetchServiceProviders: () => Promise<void>;
  fetchFollowUpTriggers: () => Promise<void>;
};

export const useSystemStore = create<SystemStore>((set) => ({
  jobs: [],
  departments: [],
  conversationTags: [],
  plans: [],
  permissions: [],
  serviceProviders: [],
  followUpTriggers: [],
  loading: false,
  error: null,

  fetchJobs: async (organizationId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/system-params/jobs?organizationId=${organizationId}`);
      if (!res.ok) throw new Error('Erro ao buscar jobs');
      const data = await res.json();
      set({ jobs: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchDepartments: async (organizationId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/system-params/departments?organizationId=${organizationId}`);
      if (!res.ok) throw new Error('Erro ao buscar departments');
      const data = await res.json();
      set({ departments: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchConversationTags: async (organizationId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/system-params/conversation-tags?organizationId=${organizationId}`);
      if (!res.ok) throw new Error('Erro ao buscar conversationTags');
      const data = await res.json();
      set({ conversationTags: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/system-params/plans`);
      if (!res.ok) throw new Error('Erro ao buscar plans');
      const data = await res.json();
      set({ plans: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchPermissions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/system-params/permissions`);
      if (!res.ok) throw new Error('Erro ao buscar permissions');
      const data = await res.json();
      set({ permissions: mapToPermissions(data), loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchServiceProviders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/system-params/service-providers`);
      if (!res.ok) throw new Error('Erro ao buscar serviceProviders');
      const data = await res.json();
      set({ serviceProviders: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchFollowUpTriggers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/system-params/follow-up-triggers`);
      if (!res.ok) throw new Error('Erro ao buscar followUpTriggers');
      const data = await res.json();
      set({ followUpTriggers: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },
}));

function mapToPermissions(permissions: any[]): Permission[] {
  return permissions.map(permission => ({
    id: permission.id,
    organizationId: permission.organization_id,
    code: permission.code,
    descriptionPt: permission.description_pt,
    descriptionEn: permission.description_en,
    groupId: permission.group_id,
    groupNameEn: permission.group_name_en,
    groupNamePt: permission.group_name_pt,
  }));
}