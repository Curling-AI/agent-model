import { Organization } from '@/types';
import { BASE_URL } from '@/utils/constants';
import { create } from 'zustand';

interface OrganizationState {
  organization: Organization;
  loading: boolean;
  error: string | null;
  setOrganization: (org: Organization) => void;
  upsertOrganization: (org: Organization) => Promise<Organization| undefined>;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organization: {
    id: 0,
    companyName: '',
    cnpj: '',
    cep: '',
    address: '',
    number: '',
    city: '',
    state: '',
    segment: '',
    website: '',
    language: 'pt' as 'pt' | 'en'
  },
  loading: false,
  error: null,

  setOrganization: (org) => set({ organization: org }),

  upsertOrganization: async (org) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/organizations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(org),
      });
      if (!res.ok) throw new Error('Falha ao salvar organização');
      const data = mapToOrganization(await res.json());
      set({ organization: data, loading: false });
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  }
}));

function mapToOrganization(data: any): Organization {
  return {
    id: data.id,
    companyName: data.company_name,
    cnpj: data.cnpj,
    cep: data.cep,
    address: data.address,
    number: String(data.number),
    city: data.city,
    state: data.state,
    website: data.website,
    segment: data.segment,
    language: data.language as 'pt' | 'en'
  };
}