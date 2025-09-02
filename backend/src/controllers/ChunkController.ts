import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';

const embeddings = new OpenAIEmbeddings();

// POST /api/chunks
export const ChunkController = {
  store: async (req: Request, res: Response) => {
    const { chunks } = req.body;
    if (!Array.isArray(chunks) || chunks.length === 0) {
      return res.status(400).json({ error: 'Chunks array is required.' });
    }

    try {
    const vectorStore = new SupabaseVectorStore(
      embeddings, 
      {
        client: supabase,
        tableName: 'documents',
        queryName: 'match_documents',
      }
    );

    await vectorStore.addDocuments(chunks);

    return res.status(201).json({
      message: 'Chunks inserted successfully.'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
  },
};
