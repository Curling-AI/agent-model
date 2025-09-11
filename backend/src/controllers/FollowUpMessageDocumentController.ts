import { getByAgentId, getByFilter, getById, remove, upsert } from '@/services/storage';
import { Request, Response } from 'express';


export const FollowUpMessageDocumentController = {

// Upsert (create or update) FollowUpMessageDocument
upsert: async (req: Request, res: Response) => {
  try {
    const followUpMessageDocument = req.body;
    const result = await upsert('follow_up_message_documents', followUpMessageDocument);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upsert follow up message document', details: err });
  }
},

// List FollowUpMessageDocuments with optional agent filter
list: async (req: Request, res: Response) => {
  try {
    const messageId = req.query.messageId as string | undefined;
    const result = await getByFilter('follow_up_message_documents', { follow_up_message_id: Number(messageId) });
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list follow up message documents', details: err });
  }
},

// Delete FollowUpMessageDocument by ID
delete: async (req: Request, res: Response) => {
    try {
      const document = await getById('follow_up_message_documents', Number(req.params.id));
      if (!document) return res.status(404).json({ error: 'Follow Up Message Document not found' });
      await remove('follow_up_message_documents', Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}