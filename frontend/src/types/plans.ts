export interface StripePrice {
  id: string;
  unit_amount: number | null;
  currency: string;
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    interval_count?: number;
  };
}

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  type: 'subscription' | 'transactional';
  default_price?:
    | string
    | {
        id: string;
        unit_amount: number;
        currency: string;
        recurring?: {
          interval: 'month' | 'year';
          interval_count: number;
        };
      };
  metadata?: Record<string, string>;
  prices?: StripePrice[];
}

export interface Invoice {
  id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  description?: string;
  period_start?: number;
  period_end?: number;
}

export interface UserPlan {
  id: number;
  user_id: number;
  plan_id: number;
  status: 'active' | 'inactive' | 'paused' | 'expired';
  provider_data: {
    subscription_id?: string;
    customer_id?: string;
    price_id?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface UserCredits {
  total: number;
  used: number;
  available: number;
  last_updated: string;
}

export interface UserUsageData {
  messages: { used: number; limit: number; percentage: number };
  leads: { used: number; limit: number; percentage: number };
  agents: { used: number; limit: number; percentage: number };
  conversations: { used: number; limit: number; percentage: number };
}
