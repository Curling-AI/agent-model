import { Request, Response } from 'express';

export const FacebookController = {
  // Obtém um access token do Facebook
  async getAccessToken(req: Request, res: Response) {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'code is required' });
    }
    try {
      const params = new URLSearchParams({
        code: code as string,
        client_id: process.env.FACEBOOK_APP_ID || '',
        client_secret: process.env.FACEBOOK_APP_SECRET || '',
        grant_type: 'authorization_code',
      })
      const response = await fetch(
        `${process.env.FACEBOOK_URL}/${process.env.FACEBOOK_GRAPH_API_VERSION}/oauth/access_token?${params.toString()}`,
        {
          method: 'GET',
        },
      )
      const data = await response.json()
  
      res.status(response.status).json(data)
    } catch (error) {
      console.error('Error fetching Facebook access token:', error)
      res.status(500).json({ error: 'Failed to fetch Facebook access token' })
    }
  },

  async subscribeApp(req: Request, res: Response) {
    try {
      const { accessToken, wabaId } = req.body as { accessToken: string; wabaId: string }

      const response = await fetch(
        `${process.env.FACEBOOK_URL}/${process.env.FACEBOOK_GRAPH_API_VERSION}/${wabaId}/subscribed_apps`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      const data = await response.json()
      res.status(response.status).json(data)
    } catch (error) {
      console.error('Error subscribing apps', error)
      res.status(500).json({ error: 'Failed to subscribe apps' })
    }
  },

  // Registra o número do WhatsApp Business
  async registerNumber(req: Request, res: Response) {
    try {
      const { phoneNumberId, facebookAccessToken } = req.body as {
        phoneNumberId: string
        facebookAccessToken: string
      }

      const response = await fetch(
        `${process.env.FACEBOOK_URL}/${process.env.FACEBOOK_GRAPH_API_VERSION}/${phoneNumberId}/register`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${facebookAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messaging_product: 'whatsapp', pin: '123456' }),
        },
      )
      const data = await response.json()
      res.status(response.status).json(data)
    } catch (error) {
      console.error('Error registering phone number', error)
      res.status(500).json({ error: 'Failed to register phone number' })
    }
  },
};