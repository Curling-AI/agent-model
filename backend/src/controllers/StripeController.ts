import { Request, Response } from 'express';
import Stripe from 'stripe';

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

  
};