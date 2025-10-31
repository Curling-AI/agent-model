import { Lead, LeadCRMHistory } from '@/types/lead';
import { BASE_URL } from '@/utils/constants';
import { create } from 'zustand';

interface LeadState {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  leadsCRMHistory: LeadCRMHistory[];
  setLead: (leads: Lead[]) => void;
  fetchLeads: (organizationId: number) => Promise<void>;
  upsertLead: (lead: Lead) => Promise<void>;
  deleteLead: (leadId: number) => Promise<void>;
  fetchLeadsCRMHistory: (organizationId: number) => Promise<void>;
}

export const useLeadStore = create<LeadState>((set, get) => ({
  leads: [],
  loading: false,
  error: null,
  leadsCRMHistory: [],
  setLead: (leads) => set({ leads }),
  fetchLeads: async (organizationId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${BASE_URL}/leads?organizationId=${organizationId}`);
      const data = await response.json();
      set({ leads: mapToLead(data), loading: false });
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      set({ error: 'Falha ao buscar leads.', loading: false });
    }
  },

  upsertLead: async (lead) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lead),
      });
      const savedLead = await response.json();

      const filteredLeads = get().leads.filter((d) => d.id !== savedLead.id);

      // Create
      set((_) => ({
        leads: mapToLead([...filteredLeads, savedLead]),
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to upsert lead:", error);
      set({ error: 'Falha ao salvar o lead.', loading: false });
    }
  },

  deleteLead: async (leadId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${BASE_URL}/leads/${leadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }
      
      set((state) => ({
        leads: state.leads.filter((d) => d.id !== leadId),
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to delete lead:", error);
      set({ error: 'Falha ao deletar o lead.', loading: false });
    }
  },

  fetchLeadsCRMHistory: async (organizationId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${BASE_URL}/leads/history?organizationId=${organizationId}`);
      const data = await response.json();
      set({ leadsCRMHistory: data.map((item: any) => ({
        id: item.id,
        lead: mapToLead([item.leads])[0],
        oldStatus: item.old_status,
        newStatus: item.new_status,
        createdAt: item.created_at,
        agentId: item.agent_id,
      })), loading: false });
    } catch (error) {
      console.error("Failed to fetch leads CRM history:", error);
      set({ error: 'Falha ao buscar histórico de leads.', loading: false });
    }
  },
}));

function mapToLead(data: any[]): Lead[] {
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    company: item.company,
    email: item.email,
    phone: item.phone,
    value: item.value,
    source: item.source,
    observation: item.observation,
    priority: item.priority,
    tags: item.tags || [],
    status: item.status,
    organizationId: item.organization_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};