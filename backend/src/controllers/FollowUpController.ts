import { getByAgentId, getByFilter, getById, remove, upsert } from '@/services/storage';
import { Request, Response } from 'express';


export const FollowUpController = {

// Upsert (create or update) FollowUp
upsert: async (req: Request, res: Response) => {
  try {
    const followUp = req.body;
    const result = await upsert('follow_ups', followUp);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upsert follow up', details: err });
  }
},

// List FollowUps with optional agent filter
list: async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agentId as string | undefined;
    const result = await getByFilter('follow_ups', { agent_id: Number(agentId) });

    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list follow ups', details: err });
  }
},

// Delete FollowUp by ID
  delete: async (req: Request, res: Response) => {
    try {
      const document = await getById('follow_ups', Number(req.params.id));
      if (!document) return res.status(404).json({ error: 'Follow Up not found' });
      await remove('follow_ups', Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}