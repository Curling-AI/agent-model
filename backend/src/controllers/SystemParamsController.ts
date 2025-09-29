import { getAll } from '@/services/storage';
import { Request, Response } from 'express';


export const SystemParamsController = {
  listFollowUpsTriggers: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('follow_up_triggers', 'id');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list follow up triggers', details: err });
    }
  },
  listJobs: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('jobs', 'id');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list jobs', details: err });
    }
  },
  listPermissions: async (req: Request, res: Response) => {
    try {
      const result = await getAll('permissions', 'id');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list permissions', details: err });
    }
  },
  listPlans: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('plans', 'id');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list plans', details: err });
    }
  },
  listServiceProviders: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('service_providers', 'id');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list service providers', details: err });
    }
  },
  listConversationTags: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('conversation_tags', 'id');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list conversation tags', details: err });
    }
  },
}