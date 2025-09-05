import { Request, Response } from 'express';
import { getByFilter, getById, remove, removeWithAgentId, upsertArray } from '@/services/storage';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { supabase } from '@/config/supabaseClient';
import { getEmbedding } from '@/utils/llm-embedding';

export const DocumentController = {
  // Upsert (criar ou atualizar)
  upsert: async (req: Request, res: Response) => {
    try {
      const documents = await upsertArray('documents', req.body);

      if (!documents) {
        return res.status(500).json({ error: 'Erro ao criar ou atualizar o documento.' });
      }

      // documents.map(async (doc: any) => {
      //   await storeChunks(doc.chunks);
      // });

      return res.status(200).json(documents);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  list: async (req: Request, res: Response) => {
    const { agentId, type } = req.query;
    let filter = {
      'agent_id': Number(agentId), 
    };
    if (type) {
      filter['type'] = type;
    }
    try {
      const documents = await getByFilter('documents', filter);
      return res.status(200).json({ documents });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const document = await getById('documents', Number(req.params.id));
      if (!document) return res.status(404).json({ error: 'Document not found' });
      await remove('documents', Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

async function storeChunks(chunks: any[]) {
    if (!Array.isArray(chunks) || chunks.length === 0) {
      return { error: 'Chunks array is required.' };
    }

    const embeddings = await getEmbedding();

    try {
      const vectorStore = new SupabaseVectorStore(
        embeddings, 
        {
          client: supabase,
          tableName: 'knowledge',
          queryName: 'match_knowledge',
        }
      );

      await vectorStore.addDocuments(chunks);

      return { message: 'Chunks inserted successfully.' };
    } catch (error) {
      return { error: error.message };
    }
}