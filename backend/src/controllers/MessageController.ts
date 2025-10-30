import { getMetaMediaContent, getTokenFromPhoneNumberId, sendMetaMedia, sendMetaMessage } from '@/services/facebook';
import { getByFilter, getById, upsert } from '@/services/storage';
import { createInstance, deleteInstance, generateQrCode, getInstanceStatus, getMediaContent, getTokenFromInstance, registerWebhook, sendMedia, sendMessage } from '@/services/uazapi';
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
      const { to, message, instanceName, conversationId } = req.body;

      if (!to || !message || !conversationId || !instanceName) {
        return res.status(400).json({ error: 'to, message, conversationId e instanceName são obrigatórios' });
      }

      const token = await getTokenFromInstance(instanceName as string);

      const response = await sendMessage(to, message, token);
      
      if (!response) {
        const errorData = response;
        return res.status(500).json({ error: 'Erro ao enviar mensagem', details: errorData });
      }

      await upsert('conversation_messages', { conversation_id: conversationId, sender: 'member', content: message, metadata: response, timestamp: new Date() });
     
      res.json({ success: true, response });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao enviar mensagem', details: error.message });
    }
  },

  async sendMedia(req: Request, res: Response) {
    try {
      const { to, media, name, type, instanceName, conversationId } = req.body;
      if (!to || !media || !type || !conversationId) {
        return res.status(400).json({ error: 'to, media e type são obrigatórios' });
      }

      const token = await getTokenFromInstance(instanceName as string);

      const data = await sendMedia(to, media, type, token, name);

      if (!data) {
        return res.status(500).json({ error: 'Erro ao enviar mídia', details: data });
      }

      await upsert('conversation_messages', { conversation_id: conversationId, sender: 'member', content: '', metadata: data, timestamp: new Date() });

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

  async getInstanceStatusNotOfficialApi(req: Request, res: Response) {
    try {
      const { instanceName } = req.query;
      const token = await getTokenFromInstance(instanceName as string);

      const data = await getInstanceStatus(token);

      res.json({ success: true, status: data });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao obter status de conexão Uazapi', details: error.message });
    }
  },

  async getMediaContent(req: Request, res: Response) {
    try {
      const { id: messageId, instanceName } = req.query;
      if (!messageId) {
        return res.status(400).json({ error: 'messageId é obrigatório' });
      }
      const message = await getById<any>('conversation_messages', Number(messageId));
      const token = instanceName ? await getTokenFromInstance(instanceName as string) : message.metadata.token as string;

      if (!message || !token) {
        return res.status(404).json({ error: 'Mensagem não encontrada' });
      }
      const data = await getMediaContent(message.metadata.message?.id || message.metadata.id, token);
      if (data.error) {
        return res.status(500).json({ success: false, error: data });
      }
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao obter conteúdo da mídia', details: error.message });
    }
  },

  async getMetaMediaContent(req: Request, res: Response) {
    try {
      const { id: messageId } = req.query;
      if (!messageId) {
        return res.status(400).json({ error: 'messageId é obrigatório' });
      }
      const message = await getById<any>('conversation_messages', Number(messageId));
      const token = await getTokenFromPhoneNumberId(message.metadata.metadata?.phone_number_id as string);
      const data = await getMetaMediaContent(message.metadata.message, token);
      res.json({ success: true, data });
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ error: 'Erro ao obter conteúdo da mídia', details: error.message });
    }
  },

  async sendMetaMessage(req: Request, res: Response) {
    try {
      const { to, message, conversationId } = req.body;
      if (!to || !message || !conversationId) {
        return res.status(400).json({ error: 'to, message e conversationId são obrigatórios' });
      }

      const messages = await getByFilter('conversation_messages', { conversation_id: conversationId, sender: 'human' }) as any[];
      if (!messages || messages.length === 0) {
        return res.status(404).json({ error: 'Mensagem não encontrada' });
      }
      const lastMessage = messages[messages.length - 1];
      const token = await getTokenFromPhoneNumberId(lastMessage.metadata.metadata?.phone_number_id as string);

      const data = await sendMetaMessage(lastMessage.metadata.metadata?.phone_number_id as string, to, message, token);
      if (!data) {
        return res.status(500).json({ error: 'Erro ao enviar mensagem', details: data });
      }
      await upsert('conversation_messages', { conversation_id: conversationId, sender: 'member', content: message, metadata: data, timestamp: new Date() });
      res.json({ success: true, data });
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ error: 'Erro ao enviar mensagem', details: error.message });
    }
  },
  
  async sendMetaMedia(req: Request, res: Response) {
    try {
      const { to, media, name, type, conversationId, mimeType } = req.body;
      if (!to || !media || !type || !conversationId || !mimeType) {
        return res.status(400).json({ error: 'to, media e type são obrigatórios' });
      }
      const messages = await getByFilter('conversation_messages', { conversation_id: conversationId, sender: 'human' }) as any[];
      if (!messages || messages.length === 0) {
        return res.status(404).json({ error: 'Mensagem não encontrada' });
      }
      const lastMessage = messages[messages.length - 1];
      const token = await getTokenFromPhoneNumberId(lastMessage.metadata.metadata?.phone_number_id as string);
      const data = await sendMetaMedia(lastMessage.metadata.metadata?.phone_number_id as string, to, media, type, mimeType, token, name);
      if (!data) {
        return res.status(500).json({ error: 'Erro ao enviar mídia', details: data });
      }
      await upsert('conversation_messages', { conversation_id: conversationId, sender: 'member', content: '', metadata: data, timestamp: new Date() });
      res.json({ success: true, data });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao enviar mídia', details: error.message });
      }
    }
};
