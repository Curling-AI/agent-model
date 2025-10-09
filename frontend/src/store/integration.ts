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
  createNotOfficialInstance: (instanceName: string) => Promise<any>;
  deleteNotOfficialInstance: (instanceName: string) => Promise<void>;
  getNotOfficialQrCode: (instanceName: string) => Promise<any>;
}

export const useIntegrationStore = create<IntegrationState>((set) => ({
  integrations: [],

  fetchIntegrations: async (agentId: number) => {
    const res = await fetch(`${BASE_URL}/integrations?agentId=${agentId}`);
    if (res.ok) {
      const data = await res.json();
      
      set({ integrations: data.map((item: any) => mapToIntegration(item)) } );
    }
  },

  upsertIntegration: async (integration) => {
    const res = await fetch(`${BASE_URL}/integrations`, {
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
    const res = await fetch(`${BASE_URL}/integrations?agentId=${agentId}&serviceProviderId=${serviceProviderId}`, { method: 'DELETE' });
    if (res.ok) {
      set((state) => ({
        integrations: state.integrations.filter(i => i.serviceProviderId !== serviceProviderId && i.agentId !== agentId),
      }));
    }
  },

  getFacebookAccessToken: async (code: string) => {
    const res = await fetch(`${BASE_URL}/facebook/access-token?code=${code}`, {
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
    const res = await fetch(`${BASE_URL}/facebook/subscribe-app`, {
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
    const res = await fetch(`${BASE_URL}/facebook/register-number`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumberId, facebookAccessToken }),
    });
    if (!res.ok) throw new Error('Erro ao registrar número');
    return res.json();
  },

  createNotOfficialInstance: async (instanceName: string) => {
    const res = await fetch(`${BASE_URL}/messages/create-instance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({instanceName})
    });
    if (!res.ok) throw new Error('Erro ao obter instância Uazapi');
    return res.json();
  },

  deleteNotOfficialInstance: async (instanceName: string) => {
    const res = await fetch(`${BASE_URL}/messages/delete-instance?instanceName=${instanceName}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao obter instância Uazapi');
    return res.json();
  },

  getNotOfficialQrCode: async (instanceName: string) => {
    console.log('Fetching QR Code for instance:', instanceName);
    const res = await fetch(`${BASE_URL}/messages/qrcode?instanceName=${instanceName}`);
    if (!res.ok) throw new Error('Erro ao obter qrcode de conexão Uazapi');
    return res.json();
  },
}));

function mapToIntegration(data: any): Integration {
  return {
    id: data.id,
    agentId: data.agent_id ?? data.agentId,
    serviceProviderId: data.service_provider_id ?? data.serviceProviderId,
    metadata: data.metadata,
  };
}