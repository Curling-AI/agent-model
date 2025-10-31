import { Request, Response } from 'express';
import { runWorkflow } from '../services/ai/agent-workflow';

export const TestController = {
  async call(req: Request, res: Response) {
    try {
      const input = req.body.input as string || '';
      const result = await runWorkflow(input);
      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
