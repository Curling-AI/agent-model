import { getByFilter, getById, upsert } from '@/services/storage';
import { Request, Response } from 'express';
import { AiExecutor } from '@/services/ai/ai-executor';
import { getMediaContent, sendMedia, sendMessage } from '@/services/uazapi';
import { sendMessage as sendMessageZapi } from '@/services/zapi';
import Stripe from 'stripe';
import { StripeService } from '../services/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});


export const WebhookController = {

  upsertMeta: async (req: Request, res: Response) => {
    try {
      const conversation = req.body;
      const result = await upsert('conversations', conversation);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to upsert conversation', details: err });
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
        await sendMessageZapi('5521997363927', message.output);
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