import { Request, Response } from 'express';

// Mock database
let agents: any[] = [];
let nextId = 1;

// Controller
export const AgentController = {
  getAll: (req: Request, res: Response) => {
    res.json(agents);
  },

  getById: (req: Request, res: Response) => {
    const agent = agents.find(a => a.id === Number(req.params.id));
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  },

  create: (req: Request, res: Response) => {
    const agent = { ...req.body, id: nextId++ };
    agents.push(agent);
    res.status(201).json(agent);
  },

  update: (req: Request, res: Response) => {
    const idx = agents.findIndex(a => a.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Agent not found' });
    agents[idx] = { ...agents[idx], ...req.body };
    res.json(agents[idx]);
  },

  delete: (req: Request, res: Response) => {
    const idx = agents.findIndex(a => a.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Agent not found' });
    agents.splice(idx, 1);
    res.status(204).send();
  }
};