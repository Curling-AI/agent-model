import { getByFilter, getById, upsert } from '@/services/storage';
import { Request, response, Response } from 'express';
import { AiExecutor } from '@/services/ai/ai-executor';
import { getMediaContent, sendMedia, sendMessage } from '@/services/uazapi';
import { sendMessage as sendMessageZapi } from '@/services/zapi';
import { getMetaMediaContent, sendMetaMedia, sendMetaMessage } from '@/services/facebook';
import Stripe from 'stripe';
import { StripeService } from '../services/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});


export const WebhookController = {

  validateMeta: async (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    }
  },

  upsertMeta: async (req: Request, res: Response) => {
    // Used to avoid multiple responses
    res.status(200).send('EVENT_RECEIVED');

    try {
      const body = req.body;

      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            const value = change.value;
            const field = change.field;

            const metadata = value.metadata; 
            const contacts = value.contacts;
            const messages = value.messages;

            if (messages && Array.isArray(messages)) {
              for (const message of messages) {
                const from = message.from;
                const timestamp = message.timestamp;
                const type = message.type;
                const text = message.text?.body;

                const integrations = await getByFilter('integrations', { 'metadata->>phoneNumberId': metadata.phone_number_id });

                if (!integrations || integrations.length === 0) {
                  return res.status(404).json({ error: 'Integration not found' });
                }

                let conversation;
                const phone = from.replace(/[^0-9]/g, '')
                const agent = await getById('agents', integrations[0]['agent_id']);

                if (!agent || agent['active'] === false) {
                  return res.status(404).json({ error: 'Agent not found' });
                }

                let lead = await getByFilter('leads', { phone });
                
                if (lead && lead.length > 0) {
                  const newConversation = await getByFilter('conversations', { lead_id: lead[0]['id'], agent_id: agent['id'] });
                  conversation = newConversation && newConversation.length > 0 ? newConversation[0] : null;
                } else {
                  const newLead = await upsert('leads', { phone: phone, name: contacts[0].profile.name || 'Desconhecido', organization_id: agent['organization_id'], value: 0, source: 'whatsapp' });
                  conversation = await upsert('conversations', { lead_id: newLead['id'], agent_id: agent['id'], organization_id: agent['organization_id'] });
                }
                
                await upsert('conversation_messages', { conversation_id: conversation['id'], sender: 'human', content: text || '', metadata: message, timestamp: new Date(timestamp * 1000) });

                if (conversation['mode'] === 'agent') {
                  let responseMessage;
                  const token = integrations[0]['metadata']['accessToken'];
                  const wpNumberId = integrations[0]['metadata']['phoneNumberId'];

                  if (type === 'video' || type === 'document') {
                    responseMessage.outputText = "Tipo de mídia não suportado no momento.";
                  } else if (type !== 'text') {
                    const mediaContent = await getMetaMediaContent(message, token);
                    responseMessage = await AiExecutor.executeAgentMedia(agent['id'], conversation['lead_id'], mediaContent, type);
                  } else {
                    responseMessage = await AiExecutor.executeAgentText(agent['id'], conversation['lead_id'], text);
                  }

                  await upsert('conversation_messages', { conversation_id: conversation['id'], sender: 'agent', content: responseMessage.outputText, metadata: responseMessage, timestamp: new Date() });

                  if (responseMessage.type === 'audio') {
                    await sendMetaMedia(wpNumberId, phone, responseMessage.output, 'audio', 'audio/ogg', token);
                  } else {
                    await sendMetaMessage(wpNumberId, phone, responseMessage.outputText, token);
                  }
                }
              }
            }
          }
        }
      } else {
        res.sendStatus(404);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Failed to process webhook', details: err });
    }
  },

  upsertZapi: async (req: Request, res: Response) => {
    try {
      const webhookContent = req.body;
      let conversation;
      const integrations = await getByFilter('integrations', { 'metadata->instance->>id': webhookContent.instanceId });

      if (!integrations) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      const agent = await getById('agents', integrations[0]['agent_id']);

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      let lead = await getByFilter('leads', { phone: webhookContent.phone });

      if (lead && lead.length > 0) {
        const newConversation = await getByFilter('conversations', { lead_id: lead[0]['id'], agent_id: agent['id'] });
        conversation = newConversation && newConversation.length > 0 ? newConversation[0] : null;
      } else {
        const newLead = await upsert('leads', { phone: webhookContent.phone, name: webhookContent.senderName || 'Desconhecido', organization_id: agent['organization_id'], value: 0 });
        conversation = await upsert('conversations', { lead_id: newLead['id'], agent_id: agent['id'], organization_id: agent['organization_id'] });
      }

      await upsert('conversation_messages', { conversation_id: conversation['id'], sender: 'human', content: webhookContent.text.message, metadata: webhookContent, timestamp: new Date(webhookContent.momment) });

      if (conversation['mode'] === 'agent') {
        const message = await AiExecutor.executeAgentText(agent['id'], conversation['lead_id'], webhookContent.text.message);

        await upsert('conversation_messages', { conversation_id: conversation['id'], sender: 'agent', content: message.output, metadata: message, timestamp: new Date() });
        await sendMessageZapi('', message.output);
      }

      res.status(200).json({ message: 'Webhook processed successfully', conversation });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Failed to upsert conversation', details: err });
    }
  },

  upsertUazapi: async (req: Request, res: Response) => {
    try {
      const webhookContent = req.body;

      if (webhookContent.message.fromMe) {
        return res.status(200).json({ message: 'Message from self, ignoring.' });
      }

      const integrations = await getByFilter('integrations', { 'metadata->instance->>token': webhookContent.token });

      if (!integrations || integrations.length === 0) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      let conversation;
      const phone = webhookContent.message.sender_pn.replace(/[^0-9]/g, '')
      const agent = await getById('agents', integrations[0]['agent_id']);

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      let lead = await getByFilter('leads', { phone });

      if (lead && lead.length > 0) {
        const newConversation = await getByFilter('conversations', { lead_id: lead[0]['id'], agent_id: agent['id'] });
        conversation = newConversation && newConversation.length > 0 ? newConversation[0] : null;
      } else {
        const newLead = await upsert('leads', { phone: phone, name: webhookContent.message.senderName || 'Desconhecido', organization_id: agent['organization_id'], value: 0, source: 'whatsapp' });
        conversation = await upsert('conversations', { lead_id: newLead['id'], agent_id: agent['id'], organization_id: agent['organization_id'] });
      }

      await upsert('conversation_messages', { conversation_id: conversation['id'], sender: 'human', content: webhookContent.message.text, metadata: webhookContent, timestamp: new Date(webhookContent.message.messageTimestamp) });

      if (conversation['mode'] === 'agent') {
        let message;

        if (webhookContent.message.type === 'media') {
          const mediaContent = await getMediaContent(webhookContent.message.messageid, webhookContent.token);
          message = await AiExecutor.executeAgentMedia(agent['id'], conversation['lead_id'], mediaContent, webhookContent.message.messageType === 'ImageMessage' ? 'image' : 'audio');
        } else {
          message = await AiExecutor.executeAgentText(agent['id'], conversation['lead_id'], webhookContent.message.text);
        }

        await upsert('conversation_messages', { conversation_id: conversation['id'], sender: 'agent', content: message.outputText, metadata: message, timestamp: new Date() });

        res.status(200).json({ message: 'Webhook processed successfully', conversation });

        if (message.type === 'audio') {
          await sendMedia(phone, message.output, 'audio', webhookContent.token);
        } else {
          await sendMessage(phone, message.outputText, webhookContent.token);
        }

      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Failed to upsert conversation', details: err });
    }
  },

  handleStripeWebhook: async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } else {
        console.warn('STRIPE_WEBHOOK_SECRET não configurado - processando evento sem verificação');
        event = JSON.parse(req.body.toString());
      }

      switch (event.type) {
        case 'checkout.session.completed':
          await StripeService.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        
        case 'customer.subscription.created':
          await StripeService.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
          
        case 'customer.subscription.updated':
          await StripeService.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
          
        case 'invoice.payment_succeeded':
          await StripeService.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;
          
        case 'customer.subscription.deleted':
          await StripeService.handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
          break;
          
        case 'checkout.session.async_payment_failed':
          await StripeService.handleCheckoutFailed(event.data.object as Stripe.Checkout.Session);
          break;
          
        case 'checkout.session.expired':
          await StripeService.handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
          break;
          
        default:
          break;
      }

      res.json({ success: true, message: 'Webhook processado com sucesso' });

    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      
      if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
        return res.status(400).json({
          success: false,
          error: 'Assinatura do webhook inválida'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Erro interno ao processar webhook'
      });
    }
  },
}