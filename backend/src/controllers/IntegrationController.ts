import { Request, Response } from 'express';
import { upsert, getByAgentId, remove, getById, getByFilter, removeWithFilter } from '@/services/storage';

export const IntegrationController = {
  // Upsert (cria ou atualiza uma integração)
  async upsert(req: Request, res: Response) {
    try {
      const integration = await upsert('integrations', { agent_id: req.body.agentId, service_provider_id: req.body.serviceProviderId, metadata: req.body.metadata });
      res.status(201).json(integration);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to upsert integration', details: err.message });
    }
  },

  // Delete uma integração pelo id
  async delete(req: Request, res: Response) {
    const integrations = await getByFilter('integrations', { service_provider_id: Number(req.query.serviceProviderId), agent_id: Number(req.query.agentId) });
    
    if (!integrations) return res.status(404).json({ error: 'Integration not found' });
    await removeWithFilter('integrations', { agent_id: Number(req.query.agentId), service_provider_id: Number(req.query.serviceProviderId) });
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