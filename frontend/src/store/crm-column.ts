import { CrmColumn } from '@/types';
import { BASE_URL } from '@/utils/constants';
import { create } from 'zustand';

interface CrmColumnState {
  crmColumns: CrmColumn[];
  loading: boolean;
  error: string | null;
  setColumns: (columns: CrmColumn[]) => void;
  fetchCrmColumns: () => Promise<void>;
  upsertCrmColumn: (crmColumn: CrmColumn) => Promise<void>;
  deleteCrmColumn: (crmColumnId: number) => Promise<void>;
}

export const useCrmColumnStore = create<CrmColumnState>((set, get) => ({
  crmColumns: [],
  loading: false,
  error: null,
  setColumns: (columns: CrmColumn[]) => set({ crmColumns: columns }),
  fetchCrmColumns: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${BASE_URL}/crm-columns?organizationId=1`);
      const data = await response.json();
      set({ crmColumns: mapToCrmColumn(data), loading: false });
    } catch (error) {
      console.error("Failed to fetch crmColumns:", error);
      set({ error: 'Falha ao buscar crmColumns.', loading: false });
    }
  },

  upsertCrmColumn: async (crmColumn: CrmColumn) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/crm-columns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(crmColumn),
      });
      const savedCrmColumn = await response.json();

      const filteredCrmColumns = get().crmColumns.filter((d) => d.id !== savedCrmColumn.id);

      // Create
      set((_) => ({
        crmColumns: [...filteredCrmColumns, mapToCrmColumn([savedCrmColumn])[0]],
        loading: false,
      }));
      
    } catch (error) {
      console.error("Failed to upsert crmColumn:", error);
      set({ error: 'Falha ao salvar o crmColumn.', loading: false });
    }
  },

  deleteCrmColumn: async (crmColumnId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${BASE_URL}/crm-columns/${crmColumnId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete crmColumn');
      }
      
      set((state) => ({
        crmColumns: state.crmColumns.filter((d) => d.id !== crmColumnId),
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to delete crmColumn:", error);
      set({ error: 'Falha ao deletar o crmColumn.', loading: false });
    }
  },

}));

function mapToCrmColumn(data: any[]): CrmColumn[] {
  return data.map((item) => ({
    id: item.id,
    titlePt: item.title_pt,
    titleEn: item.title_en,
    color: item.color,
    isSystem: item.is_system,
    organizationId: item.organization_id,
    order: item.order,
  }));
};