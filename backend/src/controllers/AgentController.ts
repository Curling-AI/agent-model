import { getAll, getByFilter, getById, insert, remove, update, upsert } from '@/services/storage';
import { Request, Response } from 'express';

// Controller
export const AgentController = {
  getAll: (req: Request, res: Response) => {
    const { filter } = req.query;
    switch (filter) {
      case 'active':
        getByFilter('agents', { active: true }, 'name').then(data => {
          res.json(data);
        });
        break;
      case 'paused':
        getByFilter('agents', { active: false }, 'name').then(data => {
          res.json(data);
        });
        break;
      default:
        getAll('agents').then(data => {
          res.json(data);
        });
    }
  },

  getById: (req: Request, res: Response) => {
    const agent = getById('agents', Number(req.params.id));
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  },

  upsert: async (req: Request, res: Response) => {
    try {
      const agent = await upsert('agents', {...req.body});
      res.status(201).json(agent);
    } catch (error) {
      res.status(500).json({ error: error});
    }
  },

  delete: (req: Request, res: Response) => {
     const agent = getById('agents', Number(req.params.id));
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    remove('agents', Number(req.params.id));
    res.status(204).send();
  }
};