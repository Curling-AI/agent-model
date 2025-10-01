import { getByAgentId, getByFilter, getById, remove, upsert } from '@/services/storage';
import { Request, Response } from 'express';


export const WebhookController = {

  upsertMeta: async (req: Request, res: Response) => {
    try {
      const conversation = req.body;
      const result = await upsert('conversations', conversation);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to upsert conversation', details: err });
    }
  },

  upsertZapi: async (req: Request, res: Response) => {
    try {
      const conversation = req.body;
      const result = await upsert('conversations', conversation);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to upsert conversation', details: err });
    }
  },
}