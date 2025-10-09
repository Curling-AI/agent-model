import { getByFilter } from '@/services/storage';
import { createInstance, deleteInstance, generateQrCode, getTokenFromInstance, registerWebhook, sendMedia, sendMessage } from '@/services/uazapi';
import { generate } from '@langchain/core/dist/utils/fast-json-patch';
import { Request, Response } from 'express';

export const MessageController = {
  async registerWebhook(_: Request, res: Response) {
    try {
      await registerWebhook();

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao registrar webhook', details: error.message });
    }
  },

  async createInstance(req: Request, res: Response) {
    try {
      
      const { instanceName } = req.body;
      const data = await createInstance(instanceName);

      res.json({ success: true, instance: data });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao criar instância', details: error.message });
    }
  },

  async deleteInstance(req: Request, res: Response) {
    try {
      const { instanceName } = req.query;
      const token = await getTokenFromInstance(instanceName as string);

      await deleteInstance(token);

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao desconectar', details: error.message });
    }
  },

  async sendMessage(req: Request, res: Response) {
    try {
      const { to, message, instanceName } = req.body;

      if (!to || !message) {
        return res.status(400).json({ error: 'to e message são obrigatórios' });
      }

      const token = await getTokenFromInstance(instanceName as string);

      const response = await sendMessage(to, message, token);
      
      if (!response) {
        const errorData = response;
        return res.status(500).json({ error: 'Erro ao enviar mensagem', details: errorData });
      }
     
      res.json({ success: true, response });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao enviar mensagem', details: error.message });
    }
  },

  async sendMedia(req: Request, res: Response) {
    try {
      const { to, media, type, instanceName } = req.body;
      if (!to || !media || !type) {
        return res.status(400).json({ error: 'to, media e type são obrigatórios' });
      }

      const token = await getTokenFromInstance(instanceName as string);

      const response = await sendMedia(to, media, type, token);

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(500).json({ error: 'Erro ao enviar mídia', details: errorData });
      }

      const data = await response.json();

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao enviar mídia', details: error.message });
    }
  },

  async generateQrCode(req: Request, res: Response) {
    try {
      const { instanceName } = req.query;
      const token = await getTokenFromInstance(instanceName as string);

      const data = await generateQrCode(token);

      res.json({ success: true, qrCode: data.instance.qrcode });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao gerar QR Code', details: error.message });
    }
  },
};
