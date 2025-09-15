import { FollowUp, FollowUpMessage, FollowUpMessageDocument } from '@/types/follow_up';
import { BASE_URL } from '@/utils/constants';
import { FileUtils } from '@/utils/file';
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

export const useFollowUpStore = create<FollowUpState>((set, get) => ({
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
    
    set({ followUps: mapSupabaseRowToFollowUp(data) });
  },
  addOrUpdateFollowUp: async (followUp: FollowUp) => {
    const res = await fetch(`${BASE_URL}/api/follow-ups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapFollowUpToSupabaseRow(followUp)),
    });
    if (!res.ok) throw new Error('Erro ao salvar follow up');
    const saved = await res.json();

    if (get().followUps.length > 0) {
      const exists = get().followUps.find((f) => f.id === saved.id);
      if (exists) {
        return {
          followUps: get().followUps.map((f) =>
            f.id === saved.id ? saved : f
          ),
        };
      }
    }

    followUp.messages.map(m => m.followUpId = saved.id);
    get().addOrUpdateFollowUpMessage(followUp.messages);

    return saved;
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
    set({ followUpMessages: mapSupabaseRowToFollowUpMessage(data) });
  },
  addOrUpdateFollowUpMessage: async (msgs: FollowUpMessage[]) => {
    msgs.map(async m => {
      const res = await fetch(`${BASE_URL}/api/follow-ups/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([mapFollowUpMessageToSupabaseRow(m)]),
      });
      if (!res.ok) throw new Error('Erro ao salvar mensagem');
     
      const saved = await res.json();
     
      m.documents?.map(doc => doc.followUpMessageId = saved[0].id);
     
      get().addOrUpdateFollowUpMessageDocument(m.documents || []);

      if (get().followUpMessages.length > 0) {
        const exists = get().followUpMessages.find((m) => m.id === saved.id);
        if (exists) {
          return {
            followUpMessages: get().followUpMessages.map((m) =>
              m.id === saved.id ? saved : m
            ),
          };
        }
      }
      return saved;
    })
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
    const res = await fetch(`${BASE_URL}/api/follow-ups/messages/${messageId}/documents`);
    if (!res.ok) throw new Error('Erro ao buscar documentos');
    const data = await res.json();
    set({ followUpMessageDocuments: mapSupabaseRowToFollowUpMessageDocument(data) });
  },
  addOrUpdateFollowUpMessageDocument: async (docs: FollowUpMessageDocument[]) => {
    const bucket = import.meta.env.VITE_SUPABASE_STORAGE_NAME ?? "";
    if (!bucket) {
      throw new Error("SUPABASE_STORAGE_NAME environment variable is not defined");
    }
    docs.map(async d => {
      if (d.url == '' && d.file) {
        d.url = (await FileUtils.uploadToSupabaseStorage(d.file, bucket, `follow-up/`)) ?? '';
        if (d.url == '') {
          throw new Error("Erro ao fazer upload do arquivo");
        }
        delete d.file;

        const res = await fetch(`${BASE_URL}/api/follow-ups/messages/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(docs.map((d) => mapFollowUpMessageDocumentToSupabaseRow(d))),
        });
        if (!res.ok) throw new Error('Erro ao salvar documento');
      }
    });

    docs.map(d => {
      return get().fetchFollowUpMessageDocuments(d.followUpMessageId!);
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

function mapFollowUpToSupabaseRow(followUp: FollowUp) {
  return {
    id: followUp.id! <= 0 ? undefined : followUp.id,
    name: followUp.name,
    description: followUp.description,
    organization_id: followUp.organizationId,
    agent_id: followUp.agentId,
    crm_column_id: followUp.crmColumn?.id,
    trigger_id: followUp.trigger?.id,
  };
}

function mapFollowUpMessageToSupabaseRow(message: FollowUpMessage) {
  return {
    id: message.id! <= 0 ? undefined : message.id,
    follow_up_id: message.followUpId,
    message: message.message,
    delay_type: message.delayType,
    days: message.days,
    hours: message.hours,
    minutes: message.minutes,
  };
}

function mapFollowUpMessageDocumentToSupabaseRow(document: FollowUpMessageDocument) {
  return {
    id: document.id! <= 0 ? undefined : document.id,
    follow_up_message_id: document.followUpMessageId,
    name: document.name,
    type: document.type,
    url: document.url,
  };
}

function mapSupabaseRowToFollowUp(rows: []): FollowUp[] {
  const followUps = rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    organizationId: row.organization_id,
    agentId: row.agent_id,
    crmColumn: row.crm_column_id,
    trigger: row.trigger_id,
  })) as FollowUp[];
  return followUps;
}

function mapSupabaseRowToFollowUpMessage(rows: []): FollowUpMessage[] {
  const messages = rows.map((row: any) => ({
    id: row.id,
    followUpId: row.follow_up_id,
    message: row.message,
    delayType: row.delay_type,
    days: row.days,
    hours: row.hours,
    minutes: row.minutes,
    documents: [],
  }));
  return messages;
}

function mapSupabaseRowToFollowUpMessageDocument(rows: []): FollowUpMessageDocument[] {
  const documents = rows.map((row: any) => ({
    id: row.id,
    followUpMessageId: row.follow_up_message_id,
    name: row.name,
    type: row.type,
    url: row.url,
  }));
  return documents;
}