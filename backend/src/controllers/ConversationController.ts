import { getByFilter, getById, remove, upsert } from '@/services/storage';

import { Request, Response } from 'express';

import { AiExecutor } from '@/services/ai-executor';

export const ConversationController = {

  listConversations: async (req: Request, res: Response) => {
    const organizationId = Number(req.query.organizationId);
    const conversations = await getByFilter('conversations', { 'organization_id': organizationId });

    if (!conversations) return res.status(404).json({ error: 'No conversations found' });

    return res.json(conversations);
  },

  upsertConversation: async (req: Request, res: Response) => {
    try {
      const payload = {
        organization_id: req.body.organizationId,
        name: req.body.name,
        company: req.body.company,
        email: req.body.email,
        phone: req.body.phone,
        value: req.body.value,
        source: req.body.source,
        priority: req.body.priority,
        observation: req.body.observation,
        tags : req.body.tags,
        status: req.body.status,
      }

      if (req.body.id && req.body.id > 0) {
        payload['id'] = req.body.id;
      }

      const response = await upsert('conversations', payload);

      return res.json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Error upserting conversation' });
    }
  },

  deleteConversation: async (req: Request, res: Response) => {
    const conversationId = Number(req.params.id);
    try {
      const conversation = await getById('conversations', conversationId);
      if (!conversation) {
        return { status: 404, message: 'Conversation not found' };
      }

      await remove('conversations', conversationId);
      return res.status(204).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Error deleting conversation' });
    }
  },

  processMessages: async (req: Request, res: Response) => {
    const agentId = Number(req.body.agentId);
    const userInput = req.body.userInput;
    const userId = Number(req.body.userId);
    try {
      const response = await AiExecutor.executeAgent(agentId, userId, userInput);
      return res.json(response['output']);
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ error: 'Error processing messages' });
    }
  },
}