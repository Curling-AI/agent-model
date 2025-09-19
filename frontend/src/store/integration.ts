import { create } from 'zustand';
import { FacebookAccessToken } from "@/types/facebook";
import { Integration } from '@/types/integration';

interface IntegrationState {
  integrations: Integration[];
  fetchIntegrations: (agentId: number) => Promise<void>;
  upsertIntegration: (integration: Partial<Integration>) => Promise<any>;
  deleteIntegration: (id: number) => Promise<void>;
  getFacebookAccessToken: (code: string) => Promise<{ success: boolean; error?: string; data?: FacebookAccessToken }>;
  subscribeFacebookApp: (data: FacebookAccessToken) => Promise<{ success: boolean; error?: string }>;
  registerFacebookNumber: (phoneNumberId: string, facebookAccessToken: string) => Promise<{ success: boolean; error?: string }>;
}

export const useIntegrationStore = create<IntegrationState>((set, get) => ({
  integrations: [],

  fetchIntegrations: async (agentId: number) => {
    const res = await fetch(`/api/integrations/agent/${agentId}`);
    if (res.ok) {
      const data = await res.json();
      set({ integrations: data });
    }
  },

  upsertIntegration: async (integration) => {
    const res = await fetch('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(integration),
    });
    if (res.ok) {
      // Atualiza a lista após upsert
      const updated = await res.json();
      set((state) => {
        const exists = state.integrations.find(i => i.id === updated.id);
        if (exists) {
          return {
            integrations: state.integrations.map(i => i.id === updated.id ? updated : i),
          };
        }
        return { integrations: [...state.integrations, updated] };
      });
      return { success: true, data: updated };
    }
  },

  deleteIntegration: async (id) => {
    const res = await fetch(`/api/integrations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      set((state) => ({
        integrations: state.integrations.filter(i => i.id !== id),
      }));
    }
  },

  getFacebookAccessToken: async (code: string) => {
    const res = await fetch('/api/facebook/access-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error('Erro ao obter access token');
    return res.json();
  },

  subscribeFacebookApp: async (data: FacebookAccessToken) => {
    const res = await fetch('/api/facebook/subscribe-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: data.access_token, wabaId: data.waba_id }),
    });
    if (!res.ok) throw new Error('Erro ao subscrever app');
    return res.json();
  },

  registerFacebookNumber: async (phoneNumberId: string, facebookAccessToken: string) => {
    const res = await fetch('/api/facebook/register-number', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumberId, facebookAccessToken }),
    });
    if (!res.ok) throw new Error('Erro ao registrar número');
    return res.json();
  }
}));