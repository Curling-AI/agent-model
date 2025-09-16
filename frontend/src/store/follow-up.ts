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
  deleteFollowUpMessage: (id: number) => Promise<void>;
  deleteFollowUpMessageDocument: (id: number) => Promise<void>;
}

export const useFollowUpStore = create<FollowUpState>((set, get) => ({
  followUps: [],
  followUpMessages: [],
  followUpMessageDocuments: [],

  fetchFollowUps: async (agentId: number) => {
    const res = await fetch(`${BASE_URL}/api/follow-ups?agentId=${agentId}`);
    if (!res.ok) throw new Error('Erro ao buscar follow ups');
    const data = await res.json();

    if (!data) {
      set({ followUps: [] });
      return;
    }

    const content = mapSupabaseRowToFollowUp(data) as FollowUp[];
    const promises = content.map(async (fu) => {
      const messages = await fetchFollowUpMessages(fu.id!);
      return { ...fu, messages };
    });

    const follows = await Promise.all(promises);
    
    set({ followUps: follows });
  },
  addOrUpdateFollowUp: async (followUp: FollowUp) => {
    const res = await fetch(`${BASE_URL}/api/follow-ups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapFollowUpToSupabaseRow(followUp)),
    });
    if (!res.ok) throw new Error('Erro ao salvar follow up');
    const saved = await res.json();

    followUp.messages.map(m => m.followUpId = saved.id);

    addOrUpdateFollowUpMessage(followUp.messages);

    return saved;
  },
  deleteFollowUp: async (id: number) => {
    const res = await fetch(`${BASE_URL}/api/follow-ups/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao deletar follow up');
    set((state) => ({
      followUps: state.followUps.filter((f) => f.id !== id),
    }));
  },

  deleteFollowUpMessage: async (id: number) => {
    const res = await fetch(`${BASE_URL}/api/follow-ups/messages/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao deletar mensagem');
    set((state) => ({
      followUpMessages: state.followUpMessages.filter((m) => m.id !== id),
    }));
  },

  deleteFollowUpMessageDocument: async (id: number) => {
    const res = await fetch(`${BASE_URL}/api/follow-ups/messages/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao deletar documento');
    set((state) => ({
      followUpMessageDocuments: state.followUpMessageDocuments.filter((d) => d.id !== id),
    }));
  },
}));

async function addOrUpdateFollowUpMessage(msgs: FollowUpMessage[]) {
  msgs.map(async m => {
    const res = await fetch(`${BASE_URL}/api/follow-ups/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([mapFollowUpMessageToSupabaseRow(m)]),
    });
    if (!res.ok) throw new Error('Erro ao salvar mensagem');

    const saved = await res.json();

    m.documents?.map(doc => doc.followUpMessageId = saved[0].id);

    addOrUpdateFollowUpMessageDocument(m.documents || []);
  })
}

async function addOrUpdateFollowUpMessageDocument(docs: FollowUpMessageDocument[]) {
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
    return fetchFollowUpMessageDocuments(d.followUpMessageId!);
  });
}

async function fetchFollowUpMessages(followUpId: number): Promise<FollowUpMessage[]> {
  const res = await fetch(`${BASE_URL}/api/follow-ups/${followUpId}/messages`);
  if (!res.ok) throw new Error('Erro ao buscar mensagens');

  const data = await res.json();

  const content = mapSupabaseRowToFollowUpMessage(data) as FollowUpMessage[];

  const promisesMessage = content.map(async (m) => {
    const docs = await fetchFollowUpMessageDocuments(m.id!);
    return { ...m, documents: docs };
  });

  return Promise.all(promisesMessage);
}

async function fetchFollowUpMessageDocuments(messageId: number): Promise<FollowUpMessageDocument[]> {
  const res = await fetch(`${BASE_URL}/api/follow-ups/messages/${messageId}/documents`);
  if (!res.ok) throw new Error('Erro ao buscar documentos');
  const data = await res.json();
  return mapSupabaseRowToFollowUpMessageDocument(data);
}

function mapFollowUpToSupabaseRow(followUp: FollowUp) {
  return {
    id: followUp.id! <= 0 ? undefined : followUp.id,
    name: followUp.name,
    description: followUp.description,
    organization_id: followUp.organizationId,
    agent_id: followUp.agentId,
    crm_column_id: followUp.crmColumn,
    trigger_id: followUp.trigger,
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
    messages: [],
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