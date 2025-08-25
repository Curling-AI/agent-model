export interface Organization {
  id: string;
  name: string;
  credit: number;
  payment_token: string;
}

export interface BaseInterface {
  organizationId: number;
}

export interface CrmColumn extends BaseInterface {
  id: number;
  name: string;
  isSystem: boolean;
}

export interface ServiceProvider {
  id: number;
  name: string;
  webhookUrl: string;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  priceMonth: number;
  priceYear: number;
  features: string[];
  active: boolean;
}