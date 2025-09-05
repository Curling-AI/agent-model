import { create } from 'zustand';
import { Document } from '@/types/agent';
import { BASE_URL } from '@/utils/constants';

interface DocumentState {
  documents: Document[];
  loading: boolean;
  error: string | null;
  videoDocuments: Document[];
  fileDocuments: Document[];
  faqDocuments: Document[];
  websiteDocuments: Document[];
  setDocuments: (docs: Document[]) => void;
  fetchDocuments: (agentId: number, type: string) => Promise<void>;
  createDocument: (docs: Document) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  loading: false,
  error: null,
  videoDocuments: [],
  fileDocuments: [],
  faqDocuments: [],
  websiteDocuments: [],
  setDocuments: (docs: Document[]) => set({ documents: docs }),
  fetchDocuments: async (agentId: number, type: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/documents?agentId=${agentId}&type=${type}`);
      const data = await res.json();
      if (res.ok) {
        console.log('Fetched documents:', data.documents);

        data.documents.map((doc: Document) => {
          switch (doc.type) {
            case 'video':
              set({ videoDocuments: [doc] });
              break;
            case 'file':
              set({ fileDocuments: [doc] });
              break;
            case 'faq':
              set({ faqDocuments: [doc] });
              break;
            case 'website':
              set({ websiteDocuments: [doc] });
              break;
            default:
              break;
          }
        });
        set({ documents: data.documents, loading: false });
      } else {
        set({ error: data.error || 'Erro ao carregar documentos', loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createDocument: async (doc: Document) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformDocumentsForApi([doc])),
      });
      const data = await res.json();
  
      if (res.ok && data) {
        const filteredDoc = data.documents.filter((d: Document) => d.id === doc.id);

        set({ documents: [filteredDoc, data.document], loading: false });
      } else {
        set({ error: data.error || 'Erro ao criar documento', loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteDocument: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set({ documents: get().documents.filter(doc => doc.id !== id), loading: false });
      } else {
        const data = await res.json();
        set({ error: data.error || 'Erro ao deletar documento', loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));

function transformDocumentsForApi(documents: Document[]): any[] {
  return documents.map((doc) => {
    const payload: any = {
      agent_id: doc.agentId,
      type: doc.type,
      name: doc.name,
      content: doc.content,
      chunks: doc.chunks,
    };

    if (doc.id && doc.id > 0) {
      return { ...payload, id: doc.id };
    }
    return payload;
  });
}