import { Request, Response } from 'express';

// Exemplo de implementação dos endpoints do ZapiController
export const ZapiController = {
  // Retorna informações da instância
  async instance(req: Request, res: Response) {
    try {
      const response = await fetch(`${process.env.ZAPI_API_URL}/me`, {
        headers: {
          'Client-Token': `${process.env.ZAPI_SECURITY_TOKEN}`
        }
      });

      const data = await response.json();
      res.json({ status: 'ok', instance: data });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao obter instância', details: error.message });
    }
  },

  // Envia uma mensagem de texto
  async sendMessage(req: Request, res: Response) {
    try {
      const { to, message } = req.body;
      if (!to || !message) {
        return res.status(400).json({ error: 'to e message são obrigatórios' });
      }

      const response = await fetch(`${process.env.ZAPI_API_URL}/send-text`, {
        headers: {
          'Client-Token': `${process.env.ZAPI_SECURITY_TOKEN}`
        },
        method: 'POST',
        body: JSON.stringify({
          phone: to,
          message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(500).json({ error: 'Erro ao enviar mensagem', details: errorData });
      }

      const data = await response.json();
     
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao enviar mensagem', details: error.message });
    }
  },

  // Envia uma imagem
  async sendImage(req: Request, res: Response) {
    try {
      const { to, image, caption } = req.body;
      if (!to || !image) {
        return res.status(400).json({ error: 'to e image são obrigatórios' });
      }

      const response = await fetch(`${process.env.ZAPI_API_URL}/send-image`, {
        headers: {
          'Client-Token': `${process.env.ZAPI_SECURITY_TOKEN}`
        },
        method: 'POST',
        body: JSON.stringify({
          phone: to,
          image,
          caption,
          viewOnce: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(500).json({ error: 'Erro ao enviar mensagem', details: errorData });
      }

      const data = await response.json();
     
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao enviar imagem', details: error.message });
    }
  },

  // Envia um áudio
  async sendAudio(req: Request, res: Response) {
    try {
      const { to, audio } = req.body;
      if (!to || !audio) {
        return res.status(400).json({ error: 'to e audio são obrigatórios' });
      }

      const response = await fetch(`${process.env.ZAPI_API_URL}/send-audio`, {
        headers: {
          'Client-Token': `${process.env.ZAPI_SECURITY_TOKEN}`
        },
        method: 'POST',
        body: JSON.stringify({
          phone: to,
          audio,
          viewOnce: false,
          waveform: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(500).json({ error: 'Erro ao enviar mensagem', details: errorData });
      }

      const data = await response.json();
     
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao enviar áudio', details: error.message });
    }
  },

  // Gera um QR Code
  async generateQrCode(req: Request, res: Response) {
    try {
      const response = await fetch(`${process.env.ZAPI_API_URL}/qr-code/image`, {
        headers: {
          'Client-Token': `${process.env.ZAPI_SECURITY_TOKEN}`
        }
      });
      const data = await response.json();
      res.json({ success: true, qrCode: data.value });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao gerar QR Code', details: error.message });
    }
  },
};