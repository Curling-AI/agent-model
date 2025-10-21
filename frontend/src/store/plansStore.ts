import { create } from 'zustand';
import { useAuthStore } from './auth';

// Stripe Price type for prices[] returned by backend
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
  // Pode ser um ID (string) ou um objeto de preço expandido retornado pela API
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
  prices?: StripePrice[]; // new: all active prices for the product
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

interface PlansStore {
  // Estado
  products: StripeProduct[];
  invoices: Invoice[];
  userPlan: UserPlan | null;
  userCredits: UserCredits | null;
  userUsage: UserUsageData | null;
  customerId: string | null;
  isLoadingProducts: boolean;
  isLoadingInvoices: boolean;
  isLoadingUserData: boolean;
  isCreatingCheckout: boolean;
  error: string | null;

  // Ações
  fetchProducts: () => Promise<void>;
  fetchInvoices: (customerId?: string) => Promise<void>;
  fetchUserPlan: () => Promise<void>;
  fetchUserCredits: () => Promise<void>;
  fetchUserUsage: () => Promise<void>;
  createCheckoutSession: (params: {
    price_id: string;
    mode?: 'subscription' | 'payment';
    user_id?: number;
    plan_id?: number;
    customer_email?: string;
    success_url?: string;
    cancel_url?: string;
  }) => Promise<{ checkout_url?: string; session_id?: string } | null>;
  setUserPlan: (plan: UserPlan | null) => void;
  setCustomerId: (customerId: string | null) => void;
  clearError: () => void;
}

const API_BASE_URL = (import.meta as any).env.VITE_BASE_URL || 'http://localhost:3000/api/v1';

export const usePlansStore = create<PlansStore>((set) => ({
  // Estado inicial
  products: [],
  invoices: [],
  userPlan: null,
  userCredits: null,
  userUsage: null,
  customerId: null,
  isLoadingProducts: false,
  isLoadingInvoices: false,
  isLoadingUserData: false,
  isCreatingCheckout: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoadingProducts: true, error: null });
    
    try {
      const response = await fetch(`${API_BASE_URL}/stripe/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const enriched = (data.data || []).map((p: StripeProduct) => ({ ...p }));
        set({ products: enriched });
      } else {
        throw new Error(data.error || 'Erro desconhecido ao buscar produtos');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar produtos',
        products: []
      });
    } finally {
      set({ isLoadingProducts: false });
    }
  },

  fetchInvoices: async (customerId?: string) => {
    set({ isLoadingInvoices: true, error: null });
    
    try {
      let url = '';
      if (customerId) {
        url = `${API_BASE_URL}/stripe/invoices?customer_id=${customerId}`;
      } else {
        const authState = useAuthStore.getState();
        let userId: number | undefined = undefined;
        if (typeof (authState.user as any)?.id === 'number') {
          userId = (authState.user as any).id as number;
        } else {
          await authState.getLoggedUser();
          const refreshed = useAuthStore.getState();
          if (typeof (refreshed.user as any)?.id === 'number') {
            userId = (refreshed.user as any).id as number;
          }
        }
        if (!userId) {
          set({ invoices: [] });
          return;
        }
        url = `${API_BASE_URL}/stripe/invoices?user_id=${userId}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          set({ invoices: [] });
          return;
        }
        throw new Error(`Erro ao buscar faturas: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        set({ invoices: data.data || [] });
      } else {
        set({ invoices: [] });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao conectar com o servidor',
        invoices: []
      });
    } finally {
      set({ isLoadingInvoices: false });
    }
  },

  fetchUserPlan: async () => {
    set({ isLoadingUserData: true, error: null });
    
    try {
      const authState = useAuthStore.getState();
      let userId: number | undefined = undefined;

      // Se já for numérico, usa direto
      if (typeof (authState.user as any)?.id === 'number') {
        userId = (authState.user as any).id as number;
      } else {
        await authState.getLoggedUser();
        const refreshed = useAuthStore.getState();
        if (typeof (refreshed.user as any)?.id === 'number') {
          userId = (refreshed.user as any).id as number;
        }
      }

      const url = userId !== undefined
        ? `${API_BASE_URL}/stripe/user-subscription?user_id=${userId}`
        : `${API_BASE_URL}/stripe/user-subscription`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          set({ userPlan: null });
        } else {
          throw new Error(`Erro ao buscar plano do usuário: ${response.status}`);
        }
      } else {
        const data = await response.json();
        set({ userPlan: data.data || null });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar plano do usuário',
        userPlan: null
      });
    } finally {
      set({ isLoadingUserData: false });
    }
  },

  fetchUserCredits: async () => {
    set({ isLoadingUserData: true, error: null });
    
    try {
      const mockUserCredits = {
        total: 1000,
        used: 250,
        available: 750,
        last_updated: new Date().toISOString()
      };
      
      set({ userCredits: mockUserCredits });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar créditos do usuário',
        userCredits: null
      });
    } finally {
      set({ isLoadingUserData: false });
    }
  },

  fetchUserUsage: async () => {
    set({ isLoadingUserData: true, error: null });
    
    try {
      const mockUserUsage = {
        messages: { used: 1500, limit: 5000, percentage: 30 },
        leads: { used: 25, limit: 100, percentage: 25 },
        agents: { used: 2, limit: 5, percentage: 40 },
        conversations: { used: 45, limit: 200, percentage: 22.5 }
      };
      
      set({ userUsage: mockUserUsage });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar dados de uso do usuário',
        userUsage: null
      });
    } finally {
      set({ isLoadingUserData: false });
    }
  },

  createCheckoutSession: async (params) => {
    set({ isCreatingCheckout: true, error: null });
    
    try {
      const response = await fetch(`${API_BASE_URL}/stripe/checkout/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: params.price_id,
          mode: params.mode || 'subscription',
          user_id: params.user_id,
          plan_id: params.plan_id,
          customer_email: params.customer_email,
          success_url: params.success_url || `${window.location.origin}/plans?success=true`,
          cancel_url: params.cancel_url || `${window.location.origin}/plans?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar checkout: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (data.data.checkout_url) {
          window.location.href = data.data.checkout_url;
        }
        return data.data;
      } else {
        throw new Error(data.error || 'Erro desconhecido ao criar checkout');
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao criar checkout' });
      return null;
    } finally {
      set({ isCreatingCheckout: false });
    }
  },

  setUserPlan: (plan) => set({ userPlan: plan }),

  setCustomerId: (customerId) => set({ customerId }),

  clearError: () => set({ error: null }),
}));