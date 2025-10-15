import { getByFilter, getById, upsert } from '@/services/storage';
import { Request, Response } from 'express';
import { AiExecutor } from '@/services/ai-executor';
import { getMediaContent, sendMessage } from '@/services/uazapi';
import { sendMessage as sendMessageZapi } from '@/services/zapi';
import Stripe from 'stripe';
import { supabase } from '../config/supabaseClient';

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

        await upsert('conversation_messages', { conversation_id: conversation['id'], sender: 'agent', content: message.output, metadata: message, timestamp: new Date() });
        
        await sendMessage(phone, message.output, webhookContent.token);
      }

      res.status(200).json({ message: 'Webhook processed successfully', conversation });
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
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
          
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
          
        case 'invoice.payment_succeeded':
          await handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;
          
        case 'customer.subscription.deleted':
          await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
          break;
          
        case 'checkout.session.async_payment_failed':
          await handleCheckoutFailed(event.data.object as Stripe.Checkout.Session);
          break;
          
        case 'checkout.session.expired':
          await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { user_id, plan_id } = session.metadata || {};
  
  if (!user_id || !plan_id) {
    console.warn('user_id ou plan_id não encontrados nos metadados');
    return;
  }
  if (session.mode === 'payment') {
    const lineItem = session.line_items?.data?.[0];
    const priceId = lineItem?.price?.id;
    
    await createUserSubscription({
      user_id: Number(user_id),
      plan_id: Number(plan_id),
      status: 'active',
      provider_data: {
        provider: 'stripe',
        customer_id: session.customer as string,
        checkout_session_id: session.id,
        mode: 'payment',
        price_id: priceId,
        currency: session.currency || 'brl',
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
        amount_subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
        created: session.created * 1000,
        expires_at: session.expires_at * 1000,
        success_url: session.success_url,
        cancel_url: session.cancel_url,
        payment_status: session.payment_status,
        status: session.status,
      }
    });
    
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const { user_id, plan_id } = subscription.metadata || {};
  
  if (!user_id || !plan_id) {
    console.warn('user_id ou plan_id não encontrados nos metadados da assinatura');
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  let priceInfo = null;
  
  if (priceId) {
    try {
      priceInfo = await stripe.prices.retrieve(priceId);
    } catch (error) {
      console.error('Erro ao buscar informações do preço:', error);
    }
  }

  await createUserSubscription({
    user_id: Number(user_id),
    plan_id: Number(plan_id),
    status: 'active',
    provider_data: {
      provider: 'stripe',
      subscription_id: subscription.id,
      customer_id: subscription.customer as string,
      status: subscription.status,
      start_date: (subscription as any).start_date * 1000,
      current_period_start: (subscription as any).current_period_start * 1000,
      current_period_end: (subscription as any).current_period_end * 1000,
      cancel_at_period_end: subscription.cancel_at_period_end,
      cancel_at: subscription.cancel_at ? subscription.cancel_at * 1000 : null,
      canceled_at: subscription.canceled_at ? subscription.canceled_at * 1000 : null,
      price_id: priceId || null,
      currency: priceInfo?.currency || 'brl',
      interval: priceInfo?.recurring?.interval || 'month',
      interval_count: priceInfo?.recurring?.interval_count || 1,
      interval_anchor: subscription.billing_cycle_anchor * 1000,
      collection_method: subscription.collection_method,
      created: subscription.created * 1000,
      trial_start: subscription.trial_start ? subscription.trial_start * 1000 : null,
      trial_end: subscription.trial_end ? subscription.trial_end * 1000 : null,
    }
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { data: existingSubscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('provider_data->>subscription_id', subscription.id)
    .single();

  if (existingSubscription) {
    const priceId = subscription.items.data[0]?.price.id;
    let priceInfo = null;
    
    if (priceId) {
      try {
        priceInfo = await stripe.prices.retrieve(priceId);
      } catch (error) {
        console.warn('Erro ao buscar informações do preço:', error);
      }
    }

    const updatedProviderData = {
      ...existingSubscription.provider_data,
      status: subscription.status,
      current_period_start: (subscription as any).current_period_start * 1000,
      current_period_end: (subscription as any).current_period_end * 1000,
      cancel_at_period_end: subscription.cancel_at_period_end,
      cancel_at: subscription.cancel_at ? subscription.cancel_at * 1000 : null,
      canceled_at: subscription.canceled_at ? subscription.canceled_at * 1000 : null,
      price_id: priceId || existingSubscription.provider_data.price_id,
      currency: priceInfo?.currency || existingSubscription.provider_data.currency,
      interval: priceInfo?.recurring?.interval || existingSubscription.provider_data.interval,
      interval_count: priceInfo?.recurring?.interval_count || existingSubscription.provider_data.interval_count,
      trial_start: subscription.trial_start ? subscription.trial_start * 1000 : null,
      trial_end: subscription.trial_end ? subscription.trial_end * 1000 : null,
      last_updated: Date.now(),
    };

    let newStatus = existingSubscription.status;
    switch (subscription.status) {
      case 'active':
        newStatus = 'active';
        break;
      case 'canceled':
      case 'incomplete_expired':
        newStatus = 'inactive';
        break;
      case 'past_due':
        newStatus = 'paused';
        break;
      case 'unpaid':
        newStatus = 'expired';
        break;
      default:
        newStatus = 'inactive';
    }

    await supabase
      .from('user_subscriptions')
      .update({ 
        status: newStatus,
        provider_data: updatedProviderData,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingSubscription.id);
  } else {
    console.warn(`Assinatura não encontrada no banco: ${subscription.id}`);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = (invoice as any).subscription as string;
  
  if (!customerId) {
    console.warn('customer_id não encontrado na fatura');
    return;
  }

  let subscription = null;

  if (subscriptionId) {
    const result = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('status', 'active')
      .eq('provider_data->>subscription_id', subscriptionId)
      .single();
    
    subscription = result.data;
  }

  if (!subscription && customerId) {
    const result = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('status', 'active')
      .eq('provider_data->>customer_id', customerId)
      .single();
    
    subscription = result.data;
  }

  if (subscription) {
    const amountPaid = invoice.amount_paid / 100;
    const amountDue = invoice.amount_due / 100;
    const subtotal = invoice.subtotal / 100;
    const total = invoice.total / 100;
    const tax = (invoice as any).tax ? (invoice as any).tax / 100 : 0;
    await supabase
      .from('user_subscriptions_payments')
      .insert({
        user_subscription_id: subscription.id,
        user_id: subscription.user_id,
        plan_id: subscription.plan_id,
        amount: amountPaid,
        currency: invoice.currency,
        provider_data: {
          provider: 'stripe',
          invoice_id: invoice.id,
          subscription_id: subscriptionId,
          customer_id: customerId,
          status: invoice.status,
          hosted_invoice_url: invoice.hosted_invoice_url,
          invoice_pdf: invoice.invoice_pdf,
          amount_paid: amountPaid,
          amount_due: amountDue,
          amount_remaining: invoice.amount_remaining / 100,
          subtotal: subtotal,
          total: total,
          tax: tax,
          billing_reason: invoice.billing_reason,
          collection_method: invoice.collection_method,
          created: invoice.created * 1000,
          due_date: invoice.due_date ? invoice.due_date * 1000 : null,
          period_start: invoice.period_start * 1000,
          period_end: invoice.period_end * 1000,
          attempt_count: invoice.attempt_count,
          next_payment_attempt: invoice.next_payment_attempt ? invoice.next_payment_attempt * 1000 : null,
          discount: (invoice as any).discount ? {
            coupon: (invoice as any).discount.coupon,
            start: (invoice as any).discount.start * 1000,
            end: (invoice as any).discount.end ? (invoice as any).discount.end * 1000 : null
          } : null,
        }
      });
  } else {
    console.warn(`Assinatura não encontrada para customer_id: ${customerId} ou subscription_id: ${subscriptionId}`);
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'inactive',
      updated_at: new Date().toISOString()
    })
    .eq('provider_data->>subscription_id', subscription.id);
}

async function handleCheckoutFailed(session: Stripe.Checkout.Session) {
  const { user_id, plan_id } = session.metadata || {};
  
  if (user_id && plan_id) {
    console.warn(`Pagamento falhou para user_id: ${user_id}, session: ${session.id}`);
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const { user_id, plan_id } = session.metadata || {};
  
  if (user_id && plan_id) {
    console.warn(`Sessão expirada para user_id: ${user_id}, session: ${session.id}`);
  }
}

async function createUserSubscription(data: {
  user_id: number;
  plan_id: number;
  status: string;
  provider_data: any;
}) {
  const { error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: data.user_id,
      plan_id: data.plan_id,
      status: data.status,
      provider_data: data.provider_data,
    });

  if (error) {
    console.error('Erro ao criar user_subscription:', error);
    throw error;
  }
}