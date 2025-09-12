import { CrmColumn, Plan, ServiceProvider } from '@/types';
import { ConversationTag } from '@/types/conversation';
import { FollowUpTrigger } from '@/types/follow_up';
import { AgentPermission, ConversationPermission, CrmPermission, Department, Job, ManagementPermission } from '@/types/user';
import { BASE_URL } from '@/utils/constants';
import { create } from 'zustand';

type SystemStore = {
  jobs: Job[];
  departments: Department[];
  conversationTags: ConversationTag[];
  plans: Plan[];
  crmColumns: CrmColumn[];
  crmPermissions: CrmPermission[];
  serviceProviders: ServiceProvider[];
  conversationPermissions: ConversationPermission[];
  managementPermissions: ManagementPermission[];
  agentPermissions: AgentPermission[];
  followUpTriggers: FollowUpTrigger[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  fetchDepartments: () => Promise<void>;
  fetchConversationTags: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  fetchCrmColumns: () => Promise<void>;
  fetchCrmPermissions: () => Promise<void>;
  fetchServiceProviders: () => Promise<void>;
  fetchConversationPermissions: () => Promise<void>;
  fetchManagementPermissions: () => Promise<void>;
  fetchAgentPermissions: () => Promise<void>;
  fetchFollowUpTriggers: () => Promise<void>;
};

export const useSystemStore = create<SystemStore>((set) => ({
  jobs: [],
  departments: [],
  conversationTags: [],
  plans: [],
  crmColumns: [],
  crmPermissions: [],
  serviceProviders: [],
  conversationPermissions: [],
  managementPermissions: [],
  agentPermissions: [],
  followUpTriggers: [],
  loading: false,
  error: null,

  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/system-params/jobs`);
      if (!res.ok) throw new Error('Erro ao buscar jobs');
      const data = await res.json();
      set({ jobs: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchDepartments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/system-params/departments`);
      if (!res.ok) throw new Error('Erro ao buscar departments');
      const data = await res.json();
      set({ departments: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchConversationTags: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/system-params/conversation-tags`);
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
      const res = await fetch(`${BASE_URL}/api/system-params/plans`);
      if (!res.ok) throw new Error('Erro ao buscar plans');
      const data = await res.json();
      set({ plans: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchCrmColumns: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/system-params/crm-columns`);
      if (!res.ok) throw new Error('Erro ao buscar crmColumns');
      const data = await res.json();
      set({ crmColumns: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchCrmPermissions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/system-params/crm-permissions`);
      if (!res.ok) throw new Error('Erro ao buscar crmPermissions');
      const data = await res.json();
      set({ crmPermissions: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchServiceProviders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/system-params/service-providers`);
      if (!res.ok) throw new Error('Erro ao buscar serviceProviders');
      const data = await res.json();
      set({ serviceProviders: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchConversationPermissions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/system-params/conversation-permissions`);
      if (!res.ok) throw new Error('Erro ao buscar conversationPermissions');
      const data = await res.json();
      set({ conversationPermissions: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchManagementPermissions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/system-params/management-permissions`);
      if (!res.ok) throw new Error('Erro ao buscar managementPermissions');
      const data = await res.json();
      set({ managementPermissions: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchAgentPermissions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/system-params/agent-permissions`);
      if (!res.ok) throw new Error('Erro ao buscar agentPermissions');
      const data = await res.json();
      set({ agentPermissions: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchFollowUpTriggers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/system-params/follow-up-triggers`);
      if (!res.ok) throw new Error('Erro ao buscar followUpTriggers');
      const data = await res.json();
      set({ followUpTriggers: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },
}));