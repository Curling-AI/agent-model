import { BASE_URL } from '@/utils/constants';
import { create } from 'zustand';

type SystemStore = {
  jobs: any[];
  departments: any[];
  conversationTags: any[];
  plans: any[];
  crmColumns: any[];
  crmPermissions: any[];
  serviceProviders: any[];
  conversationPermissions: any[];
  managementPermissions: any[];
  agentPermissions: any[];
  followUpTriggers: any[];
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

export const useSystemStore = create<SystemStore>((set, get) => ({
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
      set(state => ({ jobs: { ...state.jobs, jobs: data }, loading: false }));
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
      set(state => ({ departments: { ...state.departments, departments: data }, loading: false }));
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
      set(state => ({ conversationTags: { ...state.conversationTags, conversationTags: data }, loading: false }));
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
      set(state => ({ plans: { ...state.plans, plans: data }, loading: false }));
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
      set(state => ({ crmColumns: { ...state.crmColumns, crmColumns: data }, loading: false }));
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
      set(state => ({ crmPermissions: { ...state.crmPermissions, crmPermissions: data }, loading: false }));
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
      set(state => ({ serviceProviders: { ...state.serviceProviders, serviceProviders: data }, loading: false }));
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
      set(state => ({ conversationPermissions: { ...state.conversationPermissions, conversationPermissions: data }, loading: false }));
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
      set(state => ({ managementPermissions: { ...state.managementPermissions, managementPermissions: data }, loading: false }));
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
      set(state => ({ agentPermissions: { ...state.agentPermissions, agentPermissions: data }, loading: false }));
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
      set(state => ({ followUpTriggers: { ...state.followUpTriggers, followUpTriggers: data }, loading: false }));
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },
}));