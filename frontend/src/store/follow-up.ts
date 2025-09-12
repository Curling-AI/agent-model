import { FollowUp, FollowUpMessage, FollowUpMessageDocument } from '@/types/follow_up';
import { BASE_URL } from '@/utils/constants';
import { create } from 'zustand';



interface FollowUpState {
  followUps: FollowUp[];
  followUpMessages: FollowUpMessage[];
  followUpMessageDocuments: FollowUpMessageDocument[];

  fetchFollowUps: (agentId: number) => Promise<void>;
  addOrUpdateFollowUp: (followUp: Omit<FollowUp, 'id'> & { id?: number }) => Promise<void>;
  deleteFollowUp: (id: number) => Promise<void>;
  setFollowUps: (followUps: FollowUp[]) => void;

  fetchFollowUpMessages: (followUpId: number) => Promise<void>;
  addOrUpdateFollowUpMessage: (msg: Omit<FollowUpMessage[], 'id'> & { id?: number }) => Promise<void>;
  deleteFollowUpMessage: (id: number) => Promise<void>;
  setFollowUpMessages: (msgs: FollowUpMessage[]) => void;

  fetchFollowUpMessageDocuments: (messageId: number) => Promise<void>;
  addOrUpdateFollowUpMessageDocument: (doc: Omit<FollowUpMessageDocument[], 'id'> & { id?: number }) => Promise<void>;
  deleteFollowUpMessageDocument: (id: number) => Promise<void>;
  setFollowUpMessageDocuments: (docs: FollowUpMessageDocument[]) => void;
}

export const useFollowUpStore = create<FollowUpState>((set,get) => ({
  followUps: [],
  followUpMessages: [],
  followUpMessageDocuments: [],

  setFollowUps: (followUps) => set({ followUps }),
  setFollowUpMessages: (msgs) => set({ followUpMessages: msgs }),
  setFollowUpMessageDocuments: (docs) => set({ followUpMessageDocuments: docs }),

  fetchFollowUps: async (agentId: number) => {
    const res = await fetch(`${BASE_URL}/api/follow-ups?agentId=${agentId}`);
    if (!res.ok) throw new Error('Erro ao buscar follow ups');
    const data = await res.json();
    if (!data) {
      set({ followUps: [] });
      return;
    }
    set({ followUps: data });
  },
  addOrUpdateFollowUp: async (followUp) => {
    const res = await fetch(`${BASE_URL}/api/follow-ups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(followUp),
    });
    if (!res.ok) throw new Error('Erro ao salvar follow up');
    const saved = await res.json();
    set((state) => {
      const exists = state.followUps.find((f) => f.id === saved.id);
      if (exists) {
        return {
          followUps: state.followUps.map((f) =>
            f.id === saved.id ? saved : f
          ),
        };
      }
      followUp.messages.map(m => m.followUpId = saved.id);
      get().addOrUpdateFollowUpMessage(followUp.messages);
      return { followUps: [...state.followUps, saved] };
    });
  },
  deleteFollowUp: async (id: number) => {
    const res = await fetch(`${BASE_URL}/api/follow-ups/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao deletar follow up');
    set((state) => ({
      followUps: state.followUps.filter((f) => f.id !== id),
    }));
  },

  // Métodos para FollowUpMessage
  fetchFollowUpMessages: async (followUpId: number) => {
    const res = await fetch(`${BASE_URL}/api/follow-ups/${followUpId}/messages`);
    if (!res.ok) throw new Error('Erro ao buscar mensagens');
    const data = await res.json();
    set({ followUpMessages: data });
  },
  addOrUpdateFollowUpMessage: async (msgs: FollowUpMessage[]) => {
    const res = await fetch(`${BASE_URL}/api/follow-ups/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([msgs]),
    });
    if (!res.ok) throw new Error('Erro ao salvar mensagem');
    const saved = await res.json();
    set((state) => {
      const exists = state.followUpMessages.find((m) => m.id === saved.id);
      if (exists) {
        return {
          followUpMessages: state.followUpMessages.map((m) =>
            m.id === saved.id ? saved : m
          ),
        };
      }
      return { followUpMessages: [...state.followUpMessages, saved] };
    });
  },
  deleteFollowUpMessage: async (id: number) => {
    const res = await fetch(`${BASE_URL}/api/follow-ups/messages/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao deletar mensagem');
    set((state) => ({
      followUpMessages: state.followUpMessages.filter((m) => m.id !== id),
    }));
  },

  // Métodos para FollowUpMessageDocument
  fetchFollowUpMessageDocuments: async (messageId: number) => {
    const res = await fetch(`${BASE_URL}/api/follow-up/messages/${messageId}/documents`);
    if (!res.ok) throw new Error('Erro ao buscar documentos');
    const data = await res.json();
    set({ followUpMessageDocuments: data });
  },
  addOrUpdateFollowUpMessageDocument: async (docs: FollowUpMessageDocument[]) => {
    const res = await fetch(`${BASE_URL}/api/follow-ups/messages/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([docs]),
    });
    if (!res.ok) throw new Error('Erro ao salvar documento');
    const saved = await res.json();
    set((state) => {
      const exists = state.followUpMessageDocuments.find((d) => d.id === saved.id);
      if (exists) {
        return {
          followUpMessageDocuments: state.followUpMessageDocuments.map((d) =>
            d.id === saved.id ? saved : d
          ),
        };
      }
      return { followUpMessageDocuments: [...state.followUpMessageDocuments, saved] };
    });
  },
  deleteFollowUpMessageDocument: async (id: number) => {
    const res = await fetch(`${BASE_URL}/api/follow-ups/messages/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao deletar documento');
    set((state) => ({
      followUpMessageDocuments: state.followUpMessageDocuments.filter((d) => d.id !== id),
    }));
  },
}));