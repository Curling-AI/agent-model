import { Request, Response } from "express";
import { getByFilter, getById, upsertArray, remove } from "@/services/storage";

export const KnowledgeController = {

  TABLE_NAME: process.env.LLM_PROVIDER === 'openai' ? 'knowledge_openai' : 'knowledge_gemini',

  list: async (req: Request, res: Response) => {
    try {
      const filter = req.query || {};
      const knowledge = await getByFilter(KnowledgeController.TABLE_NAME, { 'agent_id': Number(filter.agentId) });
      return res.status(200).json({ knowledge });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  upsert: async (req: Request, res: Response) => {
    try {
      const knowledge = req.body;
      const response = await upsertArray(KnowledgeController.TABLE_NAME, Array.isArray(knowledge) ? knowledge : [knowledge]);
      if (!response) {
        return res.status(500).json({ error: "Error creating or updating knowledge" });
      }
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const knowledge = await getById(KnowledgeController.TABLE_NAME, id);
      if (!knowledge) return res.status(404).json({ error: "Knowledge not found" });
      await remove(KnowledgeController.TABLE_NAME, id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};