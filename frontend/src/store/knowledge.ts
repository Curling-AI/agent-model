import { Knowledge } from "@/types/agent";
import { BASE_URL } from "@/utils/constants";
import { create } from "zustand";



interface KnowledgeState {
  knowledgeList: Knowledge[];
  fetchKnowledge: (filter?: Record<string, any>) => Promise<void>;
  upsertKnowledge: (knowledge: Partial<Knowledge>) => Promise<void>;
  deleteKnowledge: (id: number) => Promise<void>;
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  knowledgeList: [],

  fetchKnowledge: async (filter = {}) => {
    const params = new URLSearchParams(filter as any).toString();
    const res = await fetch(`${BASE_URL}/knowledge${params ? `?${params}` : ""}`);
    const data = await res.json();
    set({ knowledgeList: (data.knowledge || []).map(mapToKnowledge) });
  },

  upsertKnowledge: async (knowledge) => {
    await fetch(`${BASE_URL}/knowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(knowledge),
    });
    // Atualiza a lista após upsert
    const res = await fetch(`${BASE_URL}/knowledge`);
    const data = await res.json();
    set({ knowledgeList: data.knowledge as Knowledge[] || [] });
  },

  deleteKnowledge: async (id) => {
    await fetch(`${BASE_URL}/knowledge/${id}`, { method: "DELETE" });
    set((state) => ({
      knowledgeList: state.knowledgeList.filter((k) => k.id !== id),
    }));
  },
}));

function mapToKnowledge(obj: any): Knowledge {
  return {
    id: Number(obj.id),
    agentId: Number(obj.agent_id),
    content: String(obj.content),
    documentId: Number(obj.document_id)
  };
}