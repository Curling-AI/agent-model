import { create } from 'zustand';
import { FacebookAccessToken } from "@/types/facebook";
import { Integration } from '@/types/integration';
import { BASE_URL } from '@/utils/constants';

interface IntegrationState {
  integrations: Integration[];
  fetchIntegrations: (agentId: number) => Promise<void>;
  upsertIntegration: (integration: Partial<Integration>) => Promise<any>;
  deleteIntegration: (agentId: number, channelId: number) => Promise<void>;
  getFacebookAccessToken: (code: string) => Promise<{ success: boolean; error?: string; data?: FacebookAccessToken }>;
  subscribeFacebookApp: (data: FacebookAccessToken) => Promise<{ success: boolean; error?: string }>;
  registerFacebookNumber: (phoneNumberId: string, facebookAccessToken: string) => Promise<{ success: boolean; error?: string }>;
  getZapiInstance: () => Promise<any>;
  getZapiQrCode: () => Promise<any>;
}

export const useIntegrationStore = create<IntegrationState>((set) => ({
  integrations: [],

  fetchIntegrations: async (agentId: number) => {
    const res = await fetch(`${BASE_URL}/api/integrations?agentId=${agentId}`);
    if (res.ok) {
      const data = await res.json();
      
      set({ integrations: data.map((item: any) => mapToIntegration(item)) } );
    }
  },

  upsertIntegration: async (integration) => {
    const res = await fetch(`${BASE_URL}/api/integrations`, {
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

  deleteIntegration: async (agentId: number, serviceProviderId: number) => {
    const res = await fetch(`${BASE_URL}/api/integrations?agentId=${agentId}&serviceProviderId=${serviceProviderId}`, { method: 'DELETE' });
    if (res.ok) {
      set((state) => ({
        integrations: state.integrations.filter(i => i.serviceProviderId !== serviceProviderId && i.agentId !== agentId),
      }));
    }
  },

  getFacebookAccessToken: async (code: string) => {
    const res = await fetch(`${BASE_URL}/api/facebook/access-token?code=${code}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Erro ao obter access token');
    const data = await res.json();
    if (data.error) {
      return { success: false, error: data.error.message };
    }
    return { success: true, data };
  },

  subscribeFacebookApp: async (data: FacebookAccessToken) => {
    const res = await fetch(`${BASE_URL}/api/facebook/subscribe-app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: data.access_token, wabaId: data.waba_id }),
    });
    if (!res.ok) throw new Error('Erro ao subscrever app');

    const result = await res.json();
    if (result.error) {
      return { success: false, error: result.error.message };
    }
    return { success: true };
  },

  registerFacebookNumber: async (phoneNumberId: string, facebookAccessToken: string) => {
    const res = await fetch(`${BASE_URL}/api/facebook/register-number`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumberId, facebookAccessToken }),
    });
    if (!res.ok) throw new Error('Erro ao registrar número');
    return res.json();
  },

  getZapiInstance: async () => {
    const res = await fetch(`${BASE_URL}/api/zapi/instance`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Erro ao obter instância Zapi');
    return res.json();
  },

  getZapiQrCode: async () => {
    const res = await fetch(`${BASE_URL}/api/zapi/qrcode`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Erro ao obter QR Code Zapi');

    const data = await res.json();
    if (data.error) {
      return { success: false, error: data.error.message };
    }
    return { success: true, data };
  }
}));

function mapToIntegration(data: any): Integration {
  return {
    id: data.id,
    agentId: data.agent_id ?? data.agentId,
    serviceProviderId: data.service_provider_id ?? data.serviceProviderId,
    metadata: data.metadata,
  };
}