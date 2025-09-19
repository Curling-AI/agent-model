import { Request, Response } from 'express';
import { upsert, getByAgentId, remove, getById, getByFilter } from '@/services/storage';

export const IntegrationController = {
  // Upsert (cria ou atualiza uma integração)
  async upsert(req: Request, res: Response) {
    try {
      const integration = await upsert('integrations', { ...req.body });
      res.status(201).json(integration);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to upsert integration', details: err.message });
    }
  },

  // Delete uma integração pelo id
  async delete(req: Request, res: Response) {
    const integration = getById('integrations', Number(req.params.id));
    if (!integration) return res.status(404).json({ error: 'Integration not found' });
    remove('integrations', Number(req.params.id));
    res.status(204).send();
  },

  // Lista todas as integrações pelo agentId
  async list(req: Request, res: Response) {
    try {
      const agentId = req.query.agentId as string | undefined;
      const result = await getByFilter('integrations', { agent_id: Number(agentId) });

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list integrations', details: err });
    }
  }
}