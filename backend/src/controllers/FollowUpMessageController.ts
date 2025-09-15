import { getByFilter, getById, remove, upsertArray } from '@/services/storage';
import { Request, Response } from 'express';


export const FollowUpMessageController = {

// Upsert (create or update) FollowUpMessage
upsert: async (req: Request, res: Response) => {
  try {
    const followUpMessage = req.body;
    const result = await upsertArray('follow_up_messages', followUpMessage);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upsert follow up message', details: err });
  }
},

// List FollowUpMessages with optional agent filter
list: async (req: Request, res: Response) => {
  try {
    const followUpId = req.params.followUpId as string | undefined;
    const result = await getByFilter('follow_up_messages', { follow_up_id: Number(followUpId) });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list follow up messages', details: err });
  }
},

// Delete FollowUpMessage by ID
delete: async (req: Request, res: Response) => {
    try {
      const document = await getById('follow_up_messages', Number(req.params.id));
      if (!document) return res.status(404).json({ error: 'Follow Up Message not found' });
      await remove('follow_up_messages', Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}