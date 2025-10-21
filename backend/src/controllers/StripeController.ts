import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../config/supabaseClient';
import { getByFilter, getById } from '../services/storage';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export const StripeController = {
  getAllProducts: async (req: Request, res: Response) => {
    try {
      const { limit = 100 } = req.query;
      
      const products = await stripe.products.list({
        limit: Number(limit),
        active: true,
        expand: ['data.default_price'],
      });
      
      const productsWithPrices = await Promise.all(
        products.data.map(async (p) => {
          const prices = await stripe.prices.list({
            product: p.id,
            active: true,
            limit: 100,
            expand: ['data.tiers'],
          });
          return {
            ...p,
            prices: prices.data,
          } as any;
        })
      );
      
      
      res.json({
        success: true,
        data: productsWithPrices,
        has_more: products.has_more,
        total_count: products.data.length,
      });
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar produtos',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },
  
  getUserSubscription: async (req: Request, res: Response) => {
    try {
      const userIdParam = req.query.user_id;

      let userId: number | null = null;
      if (userIdParam) {
        userId = Number(userIdParam);
      } else {
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user?.id) {
          const { data: usersByAuth, error: usersErr } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', data.user.id)
            .limit(1);
          const userRows = usersByAuth || [];
          if (userRows && userRows.length > 0) {
            userId = userRows[0].id;
          }
        }
      }

      if (!userId) {
        return res.status(400).json({ success: false, error: 'user_id não informado e usuário não autenticado' });
      }

      // Busca a assinatura mais recente/ativa do usuário
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (subError) {
        throw subError;
      }

      const subscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;

      return res.json({ success: true, data: subscription });
    } catch (error) {
      console.error('Erro ao buscar assinatura do usuário:', error);
      res.status(500).json({ success: false, error: 'Erro ao buscar assinatura do usuário' });
    }
  },

  getCustomerInvoices: async (req: Request, res: Response) => {
    try {
      const { limit = 10, customer_id, user_id } = req.query as { limit?: any; customer_id?: string; user_id?: string };
      
      let resolvedCustomerId = customer_id;
      if (!resolvedCustomerId && user_id) {
        const { data: subs } = await supabase
          .from('user_subscriptions')
          .select('provider_data')
          .eq('user_id', Number(user_id))
          .order('updated_at', { ascending: false })
          .limit(1);
        resolvedCustomerId = subs && subs.length > 0 ? (subs[0].provider_data?.customer_id as string | undefined) : undefined;
      }
      if (!resolvedCustomerId) {
        const { data, error } = await supabase.auth.getUser();
        if (!error && data?.user?.id) {
          const { data: usersByAuth } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', data.user.id)
            .limit(1);
          const dbUserId = usersByAuth && usersByAuth.length > 0 ? usersByAuth[0].id : undefined;
          if (dbUserId) {
            const { data: subs2 } = await supabase
              .from('user_subscriptions')
              .select('provider_data')
              .eq('user_id', dbUserId)
              .order('updated_at', { ascending: false })
              .limit(1);
            resolvedCustomerId = subs2 && subs2.length > 0 ? (subs2[0].provider_data?.customer_id as string | undefined) : undefined;
          }
        }
      }
      
      if (!resolvedCustomerId) {
        return res.status(404).json({ success: false, error: 'Cliente não encontrado para o usuário informado' });
      }
      
      const invoices = await stripe.invoices.list({
        customer: resolvedCustomerId as string,
        limit: Number(limit),
      });
      
      res.json({
        success: true,
        data: invoices.data,
        has_more: invoices.has_more,
        total_count: invoices.data.length,
        customer_id: resolvedCustomerId,
      });
    } catch (error) {
      console.error('Erro ao listar histórico de compras:', error);
      
      if (error instanceof Stripe.errors.StripeError && error.code === 'resource_missing') {
        return res.status(404).json({
          success: false,
          error: 'Cliente não encontrado no Stripe',
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar histórico de compras',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  createCheckoutSession: async (req: Request, res: Response) => {
    try {
      const { 
        price_id, 
        quantity = 1, 
        mode = 'subscription',
        success_url, 
        cancel_url,
        customer_email,
        user_id,
        plan_id
      } = req.body;

      if (!price_id) {
        return res.status(400).json({
          success: false,
          error: 'price_id é obrigatório',
          message: 'Informe o ID do preço no Stripe',
        });
      }

      if (!success_url || !cancel_url) {
        return res.status(400).json({
          success: false,
          error: 'URLs de redirecionamento são obrigatórias',
          message: 'Informe success_url e cancel_url',
        });
      }

      let customer_id: string | undefined;
      
      if (customer_email) {
        const existingCustomers = await stripe.customers.list({
          email: customer_email,
          limit: 1,
        });
        
        if (existingCustomers.data.length > 0) {
          customer_id = existingCustomers.data[0].id;
        } else {
          const customer = await stripe.customers.create({
            email: customer_email,
            metadata: user_id ? { user_id: user_id.toString() } : {},
          });
          customer_id = customer.id;
        }
      }

      const metadata: Record<string, string> = {};
      if (user_id) metadata.user_id = user_id.toString();
      if (plan_id) metadata.plan_id = plan_id.toString();

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
        line_items: [
          {
            price: price_id,
            quantity: Number(quantity),
          },
        ],
        success_url,
        cancel_url,
        metadata,
      };

      if (customer_id) {
        sessionParams.customer = customer_id;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      res.json({
        success: true,
        data: {
          checkout_url: session.url,
          session_id: session.id,
          customer_id,
        },
        message: 'Sessão de checkout criada com sucesso',
      });

    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar sessão de checkout',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

};