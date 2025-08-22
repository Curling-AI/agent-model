export interface Organization {
  id: string;
  name: string;
  credit: number;
}

export interface CrmColumn {
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