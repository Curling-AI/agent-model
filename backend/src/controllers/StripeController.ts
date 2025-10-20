import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../config/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export const StripeController = {
  getAllProducts: async (req: Request, res: Response) => {
    try {
      const { limit = 10 } = req.query;
      
      const products = await stripe.products.list({
        limit: Number(limit),
        active: true,
      });
      
      res.json({
        success: true,
        data: products.data,
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

  getCustomerInvoices: async (req: Request, res: Response) => {
    try {
      const { limit = 10, customer_id } = req.query;
      
      if (!customer_id) {
        return res.status(400).json({
          success: false,
          error: 'customer_id é obrigatório',
          message: 'Informe o ID do cliente no Stripe via query parameter',
        });
      }
      
      const invoices = await stripe.invoices.list({
        customer: customer_id as string,
        limit: Number(limit),
      });
      
      res.json({
        success: true,
        data: invoices.data,
        has_more: invoices.has_more,
        total_count: invoices.data.length,
        customer_id: customer_id,
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