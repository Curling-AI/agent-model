

import { Request, Response } from 'express';

export default class IndexController {
  public async getIndex(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({ message: 'ok' });
    } catch (error) {
      res.status(500).json({ error: 'bad' });
    }
  }
}