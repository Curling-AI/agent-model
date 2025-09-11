import { getAll } from '@/services/storage';
import { Request, Response } from 'express';


export const SystemParamsController = {
  listFollowUpsTriggers: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('follow_up_triggers');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list follow up triggers', details: err });
    }
  },
  listJobs: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('jobs');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list jobs', details: err });
    }
  },
  listCrmColumns: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('crm_columns');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list CRM columns', details: err });
    }
  },
  listCrmPermissions: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('crm_permissions');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list CRM permissions', details: err });
    }
  },
  listPlans: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('plans');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list plans', details: err });
    }
  },
  listServiceProviders: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('service_providers');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list service providers', details: err });
    }
  },
  listConversationTags: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('conversation_tags');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list conversation tags', details: err });
    }
  },
  listConversationPermissions: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('conversation_permissions');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list conversation permissions', details: err });
    }
  },
  listManagementPermissions: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('management_permissions');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list management permissions', details: err });
    }
  },
  listAgentPermissions: async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getAll('agent_permissions');
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list agent permissions', details: err });
    }
  },
}