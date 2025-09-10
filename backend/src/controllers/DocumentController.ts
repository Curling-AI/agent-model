import { getByFilter, getById, insert, remove, upsertArray } from '@/services/storage';
import multer from 'multer';
import { generateChunksFromFaq, generateChunksFromFile, generateChunksFromUrl, generateEmbeddingsFromChunks, generateVector } from '@/services/llm-embedding';

export const DocumentController = {
  upsert: async (req: multer.Request, res: multer.Response) => {
    try {
      const documents = req.body;
      const response = await upsertArray('documents', documents);

      if (!response) {
        return res.status(500).json({ error: 'Error creating or updating document' });
      }

      let chunks = [];
      
      switch (documents[0].type) {
        case 'website':
        case 'video':
          chunks = await generateChunksFromUrl(documents[0].content || '');
          break;
        case 'faq':
          chunks = await generateChunksFromFaq(documents[0].name, documents[0].content || '');
          break;
      }
    
      if (chunks.length > 0) {
        const texts = chunks.map((chunk) => chunk.pageContent);
        await generateEmbeddingsFromChunks(response[0]['agent_id'], response[0]['id'], texts);
      }

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  insertFromFile: async (req: multer.Request, res: multer.Response) => {
    try {
      const agentId = req.body.agentId;
      const file = req.file;

      let chunks = [];
      const extension = req.file.originalname.split('.').pop()?.toLowerCase();
      chunks = await generateChunksFromFile(file.path || '', extension);
      
      if (chunks.length > 0) {
        const document = await insert('documents', {
          agent_id: Number(agentId),
          type: 'file',
          name: file.originalname,
          content: '',
        });

        if (!document) {
          return res.status(500).json({ error: 'Error creating document' });
        }
        const texts = chunks.map((chunk) => chunk.pageContent);
        await generateEmbeddingsFromChunks(document['agent_id'], document['id'], texts);
      }

      return res.status(200).json(document);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  list: async (req: multer.Request, res: multer.Response) => {
    const { agentId, type } = req.query;
    let filter = {
      'agent_id': Number(agentId), 
    };
    if (type && type !== 'all') {
      filter['type'] = type;
    }
    try {
      const documents = await getByFilter('documents', filter);
      return res.status(200).json({ documents });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  delete: async (req: multer.Request, res: multer.Response) => {
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