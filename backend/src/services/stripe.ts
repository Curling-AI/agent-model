import Stripe from 'stripe';
import { supabaseAdmin } from '../config/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export class StripeService {
  private static async cancelOtherActiveSubscriptions(userId: number, excludeStripeSubscriptionId?: string | null) {
    const { data: actives, error } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id, plan_id, provider_data, status')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      console.error('Erro ao buscar assinaturas ativas para cancelamento:', error);
      return;
    }

    if (!actives || actives.length === 0) {
      return;
    }

    const planIds = [...new Set(actives.map((s: any) => s.plan_id))];
    const { data: plans } = await supabaseAdmin
      .from('plans')
      .select('id, type, metadata')
      .in('id', planIds);

    const plansMap = new Map(plans?.map(p => [p.id, p]) || []);

    const others = (actives || []).filter((s: any) => {
      const hasSubscriptionId = s?.provider_data?.subscription_id;
      const isDifferentSubscription = s.provider_data.subscription_id !== excludeStripeSubscriptionId;
      const plan = plansMap.get(s.plan_id);
      const isSubscriptionType = plan?.type === 'subscription';

      return hasSubscriptionId && isDifferentSubscription && isSubscriptionType;
    });

    if (others.length === 0) {
      return;
    }

    for (const sub of others) {
      const oldStripeSubId = sub.provider_data.subscription_id as string;
      
      try {
        await stripe.subscriptions.cancel(oldStripeSubId);
      } catch (err) {
        console.error(`Falha ao cancelar assinatura no Stripe (${oldStripeSubId}):`, err);
      }

      try {
        const updatedProvider = {
          ...sub.provider_data,
          status: 'canceled',
          canceled_at: Date.now(),
          cancel_reason: 'replaced_by_new_subscription',
        };

        await supabaseAdmin
          .from('user_subscriptions')
          .update({ 
            status: 'inactive', 
            provider_data: updatedProvider, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', sub.id);
      } catch (dbErr) {
        console.error(`Erro ao atualizar assinatura no banco (id: ${sub.id}):`, dbErr);
      }
    }
  }
  
  static async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { user_id, plan_id } = session.metadata || {};
    
    if (!user_id || !plan_id) {
      console.warn('user_id ou plan_id não encontrados nos metadados');
      return;
    }
    
  }

  static async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const { user_id, plan_id } = subscription.metadata || {};
    
    if (!user_id || !plan_id) {
      console.error('user_id ou plan_id não encontrados nos metadados da assinatura');
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

    let resolvedPlanId: number | null = plan_id ? Number(plan_id) : null;
    try {
      if (!resolvedPlanId && priceInfo && typeof priceInfo.product === 'string') {
        const { data: plans } = await supabaseAdmin
          .from('plans')
          .select('id, metadata')
          .eq('metadata->>stripe_product_id', priceInfo.product as string)
          .limit(1);
        if (plans && plans.length > 0) {
          resolvedPlanId = plans[0].id as number;
        }
      }
    } catch (e) {
      console.error('Falha ao mapear plan_id pelo stripe_product_id:', e);
    }

    await this.createUserSubscription({
      user_id: Number(user_id),
      plan_id: resolvedPlanId || Number(plan_id),
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

    console.log('✅ user_subscriptions criada com sucesso para user_id:', user_id);
  }

  static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const { data: existingSubscription } = await supabaseAdmin
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
          console.error('Erro ao buscar informações do preço:', error);
        }
      }

      let newPlanId = existingSubscription.plan_id;
      try {
        if (priceInfo && typeof priceInfo.product === 'string') {
          const { data: plans } = await supabaseAdmin
            .from('plans')
            .select('id, metadata')
            .eq('metadata->>stripe_product_id', priceInfo.product as string)
            .limit(1);
          if (plans && plans.length > 0) {
            newPlanId = plans[0].id as number;
          }
        }
      } catch (e) {
        console.error('Falha ao mapear plan_id pelo stripe_product_id:', e);
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

      await supabaseAdmin
        .from('user_subscriptions')
        .update({ 
          status: newStatus,
          provider_data: updatedProviderData,
          updated_at: new Date().toISOString(),
          ...(newPlanId ? { plan_id: newPlanId } : {}),
        })
        .eq('id', existingSubscription.id);
    } else {
      console.error(`Assinatura não encontrada no banco: ${subscription.id}`);
    }
  }

  static async handleInvoicePaid(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    let subscriptionId = (invoice as any).subscription as string;
    
    if (!customerId) {
      console.error('customer_id não encontrado na fatura');
      return;
    }

    // Se subscription não veio na invoice, tentar extrair de parent.subscription_details
    if (!subscriptionId && (invoice as any).parent?.subscription_details) {
      const subscriptionDetails = (invoice as any).parent.subscription_details;
      subscriptionId = subscriptionDetails.subscription as string;
    }
    
    if (!subscriptionId && invoice.id) {
      try {
        const fullInvoice = await stripe.invoices.retrieve(invoice.id, { expand: ['subscription'] });
        subscriptionId = (fullInvoice as any).subscription?.id || (fullInvoice as any).subscription as string;
        
        if (!subscriptionId && (fullInvoice as any).parent?.subscription_details) {
          subscriptionId = (fullInvoice as any).parent.subscription_details.subscription as string;
        }
      } catch (error) {
        console.error('Erro ao buscar invoice da API:', error);
      }
    }

    // Faturas sem subscriptionId são transacionais (one-off): não relacionar a user_subscriptions
    if (!subscriptionId) {
      return;
    }


    let subscription = null;

    if (subscriptionId) {
      const result = await supabaseAdmin
        .from('user_subscriptions')
        .select('*')
        .eq('provider_data->>subscription_id', subscriptionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      subscription = result.data;
    }

    if (!subscription && customerId) {
      const result = await supabaseAdmin
        .from('user_subscriptions')
        .select('*')
        .eq('provider_data->>customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      subscription = result.data;
    }

    if (!subscription && subscriptionId) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const retryResult = await supabaseAdmin
        .from('user_subscriptions')
        .select('*')
        .eq('provider_data->>subscription_id', subscriptionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      subscription = retryResult.data;
    }

    if (subscription) {

      const amountPaid = invoice.amount_paid / 100;
      const amountDue = invoice.amount_due / 100;
      const subtotal = invoice.subtotal / 100;
      const total = invoice.total / 100;
      const tax = (invoice as any).tax ? (invoice as any).tax / 100 : 0;
      
      const userSubscriptionId = Number(subscription.id);
      const userId = Number(subscription.user_id);
      const planId = Number(subscription.plan_id);
      
      const paymentData = {
        user_subscription_id: userSubscriptionId,
        user_id: userId,
        plan_id: planId,
        amount: amountPaid,
        currency: String(invoice.currency).toLowerCase(),
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
      };

      const { error: paymentError } = await supabaseAdmin
        .from('user_subscriptions_payments')
        .insert(paymentData)
        .select();

      if (paymentError) {
        console.error('Erro ao inserir pagamento:', paymentError);
      }

      // Após confirmar pagamento, cancelar outras assinaturas ativas do mesmo usuário (upgrade/downgrade)
      try {
        await this.cancelOtherActiveSubscriptions(
          subscription.user_id,
          (subscription.provider_data && subscription.provider_data.subscription_id) ? subscription.provider_data.subscription_id : null
        );
      } catch (cleanupErr) {
        console.error('Erro ao cancelar assinaturas antigas após pagamento:', cleanupErr);
      }
    } else {
      console.error(`Assinatura não encontrada para customer_id: ${customerId} ou subscription_id: ${subscriptionId}`);
    }
  }

  static async handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    await supabaseAdmin
      .from('user_subscriptions')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('provider_data->>subscription_id', subscription.id);
  }

  static async handleCheckoutFailed(session: Stripe.Checkout.Session) {
    const { user_id } = session.metadata || {};
    
    if (user_id) {
      console.error(`Pagamento falhou para user_id: ${user_id}, session: ${session.id}`);
    }
  }

  static async handleCheckoutExpired(session: Stripe.Checkout.Session) {
    const { user_id } = session.metadata || {};
    
    if (user_id) {
      console.error(`Sessão expirada para user_id: ${user_id}, session: ${session.id}`);
    }
  }

  private static async createUserSubscription(data: {
    user_id: number;
    plan_id: number;
    status: string;
    provider_data: any;
  }) {
    const { error } = await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        user_id: data.user_id,
        plan_id: data.plan_id,
        status: data.status,
        provider_data: data.provider_data,
      })
      .select();

    if (error) {
      console.error('Erro ao criar user_subscription:', error);
      throw error;
    }
  }
}